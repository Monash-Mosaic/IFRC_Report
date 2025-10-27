'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { StickyNote, X, Save, Trash2, Edit3, Bold, Italic, List, GripVertical } from 'lucide-react'
import { getNotes, saveNotes, NOTES_KEY } from '../utils/storage'

export default function NotesComponent({ sectionSlug: propSectionSlug, currentPage }) {
  console.log('NotesComponent loaded for sectionSlug =', propSectionSlug)

  // Resolve slug from prop or URL
  const [resolvedSlug, setResolvedSlug] = useState(propSectionSlug || '')
  useEffect(() => {
    if (propSectionSlug) return setResolvedSlug(propSectionSlug)
    if (typeof window !== 'undefined') {
      const m = window.location.pathname.match(/\/interactive\/section\/([^/]+)/i)
      if (m?.[1]) setResolvedSlug(decodeURIComponent(m[1]))
    }
  }, [propSectionSlug])

  // Notes state
  const [notes, setNotes] = useState([])
  const [notesLoaded, setNotesLoaded] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteText, setNewNoteText] = useState('')
  const [newNoteSize, setNewNoteSize] = useState({ width: 350, height: 300 })
  const [notePosition, setNotePosition] = useState({ x: 100, y: 100 })
  const [draggedNote, setDraggedNote] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [resizingNote, setResizingNote] = useState(null)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [editingNoteTitle, setEditingNoteTitle] = useState('')
  const [editingNoteText, setEditingNoteText] = useState('')
  const [isBoldActive, setIsBoldActive] = useState(false)
  const [isItalicActive, setIsItalicActive] = useState(false)
  const [isUnderlineActive, setIsUnderlineActive] = useState(false)

  // Refs
  const newEditorRef = useRef(null)
  const savedSelectionRef = useRef(null)
  const activeEditorRef = useRef(null)

  // Portal
  const [portalEl, setPortalEl] = useState(null)
  useEffect(() => {
    if (typeof window === 'undefined') return
    let doc = document
    try {
      if (window.top && window.top !== window && window.top.origin === window.origin)
        doc = window.top.document
    } catch {
      doc = document
    }
    let el = doc.getElementById('notes-portal')
    if (!el) {
      el = doc.createElement('div')
      el.id = 'notes-portal'
      doc.body.appendChild(el)
    }
    Object.assign(el.style, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: '2147483647',
      pointerEvents: 'none',
    })
    setPortalEl(el)
  }, [])

  // Load notes
  useEffect(() => {
    if (!resolvedSlug) return
    const stored = getNotes(resolvedSlug)
    console.log('Loaded notes for', resolvedSlug, stored)
    setNotes(stored)
    setNotesLoaded(true)
  }, [resolvedSlug])

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === NOTES_KEY || e.key === null) {
        const fresh = getNotes(resolvedSlug)
        setNotes(fresh)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [resolvedSlug])

  // Auto-save
  useEffect(() => {
    if (!resolvedSlug || !notesLoaded) return
    saveNotes(resolvedSlug, notes)
  }, [notes, resolvedSlug, notesLoaded])

  useEffect(() => {
    const handler = () => {
      if (resolvedSlug && notesLoaded) saveNotes(resolvedSlug, notes)
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [notes, resolvedSlug, notesLoaded])

  // Utils
  const clampToViewport = (x, y, width = 350, height = 300) => {
    const maxX = Math.max(0, window.innerWidth - (width + 10))
    const maxY = Math.max(0, window.innerHeight - (height + 10))
    return { x: Math.min(Math.max(10, x), maxX), y: Math.min(Math.max(10, y), maxY) }
  }

  const addNote = () => {
    const html = (newEditorRef.current?.innerHTML || newNoteText || '').trim()
    if (!html || !resolvedSlug) return
    const pos = clampToViewport(notePosition.x, notePosition.y, newNoteSize.width, newNoteSize.height)
    const newNote = {
      id: Date.now(),
      title: newNoteTitle.trim() || 'Untitled Note',
      text: html,
      timestamp: new Date().toISOString(),
      position: pos,
      size: { ...newNoteSize },
      page: currentPage,
    }
    setNotes((prev) => {
      const next = [...prev, newNote]
      saveNotes(resolvedSlug, next)
      return next
    })
    setNewNoteTitle('')
    setNewNoteText('')
    setShowNoteForm(false)
    setNotePosition((p) => clampToViewport(p.x + 30, p.y + 30, newNoteSize.width, newNoteSize.height))
    setNewNoteSize({ width: 350, height: 300 })
    if (newEditorRef.current) newEditorRef.current.innerHTML = ''
  }

  const deleteNote = (noteId) => {
    setNotes(prev => {
      const next = prev.filter(n => n.id !== noteId)
      saveNotes(resolvedSlug, next)
      return next
    })
  }

  const updateNote = (id, updates) => {
    setNotes((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, ...updates, timestamp: new Date().toISOString() } : n))
      saveNotes(resolvedSlug, next)
      return next
    })
    setEditingNoteId(null)
    setEditingNoteText('')
    setEditingNoteTitle('')
  }

  const handleDragStart = (e, id) => {
    if (e.target.closest('.no-drag')) return
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    setDraggedNote(id)
    setIsDragging(true)
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleDragMove = (e) => {
    if (!(draggedNote && isDragging)) return
    e.preventDefault()
    const note =
      draggedNote === 'new-note'
        ? { size: newNoteSize }
        : notes.find((n) => n.id === draggedNote) || { size: { width: 350, height: 300 } }

    const w = note.size.width
    const h = note.size.height
    const { x, y } = clampToViewport(e.clientX - dragOffset.x, e.clientY - dragOffset.y, w, h)

    if (draggedNote === 'new-note') setNotePosition({ x, y })
    else {
      setNotes((prev) => {
        const next = prev.map((n) => (n.id === draggedNote ? { ...n, position: { x, y } } : n))
        saveNotes(resolvedSlug, next)
        return next
      })
    }
  }

  const handleResizeStart = (e, id, corner) => {
    e.preventDefault()
    e.stopPropagation()
    const note = notes.find((n) => n.id === id)
    const width = id === 'new-note' ? newNoteSize.width : note?.size?.width || 350
    const height = id === 'new-note' ? newNoteSize.height : note?.size?.height || 300
    setResizingNote({ id, corner })
    setResizeStart({ x: e.clientX, y: e.clientY, width, height })
  }

  const handleResizeMove = (e) => {
    if (!resizingNote) return
    e.preventDefault()
    const dx = e.clientX - resizeStart.x
    const dy = e.clientY - resizeStart.y
    let w = resizeStart.width
    let h = resizeStart.height
    if (resizingNote.corner.includes('right')) w = Math.max(280, resizeStart.width + dx)
    if (resizingNote.corner.includes('bottom')) h = Math.max(250, resizeStart.height + dy)

    if (resizingNote.id === 'new-note') return setNewNoteSize({ width: w, height: h })
    setNotes((prev) => {
      const next = prev.map((n) => (n.id === resizingNote.id ? { ...n, size: { width: w, height: h } } : n))
      saveNotes(resolvedSlug, next)
      return next
    })
  }

  useEffect(() => {
    const move = (e) => {
      handleDragMove(e)
      handleResizeMove(e)
    }
    const up = () => {
      setIsDragging(false)
      setDraggedNote(null)
      setResizingNote(null)
    }
    if (isDragging || resizingNote) {
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
      return () => {
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
      }
    }
  }, [isDragging, resizingNote, dragOffset, resizeStart])

  const openNoteForm = () => {
    setShowNoteForm(true)
    setNotePosition((p) => clampToViewport(p.x, p.y, newNoteSize.width, newNoteSize.height))
  }

  // ---------- UI ----------
  const overlay = (
    <div id="notes-overlay-root" className="fixed inset-0 pointer-events-none z-[2147483647]">
      {/* Floating Add Button */}
      <button
        onClick={openNoteForm}
        className="fixed bottom-8 right-8 bg-yellow-400 hover:bg-yellow-500 text-black p-4 rounded-full shadow-lg transition-all pointer-events-auto"
        title="Add Note"
      >
        <StickyNote className="w-6 h-6" />
        {notes.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {notes.length}
          </span>
        )}
      </button>

      {/* New Note */}
      {showNoteForm && (
        <div
          className="fixed bg-yellow-200 border-2 border-yellow-300 rounded-lg shadow-lg flex flex-col pointer-events-auto"
          style={{
            left: `${notePosition.x}px`,
            top: `${notePosition.y}px`,
            width: `${newNoteSize.width}px`,
            height: `${newNoteSize.height}px`,
            zIndex: 10000,
          }}
        >
          <div
            className="flex items-center justify-between p-3 bg-yellow-300 rounded-t-md cursor-move border-b border-yellow-400"
            onMouseDown={(e) => handleDragStart(e, 'new-note')}
          >
            <div className="flex items-center gap-2 flex-1">
              <GripVertical className="w-4 h-4 text-black" />
              <StickyNote className="w-4 h-4  text-black" />
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Note title..."
                className="w-full p-1 bg-yellow-200 rounded text-sm font-bold text-black placeholder-black/70 focus:outline-none no-drag"
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
            <button onClick={() => setShowNoteForm(false)} title="Close" className="no-drag">
              <X className="ml-2 w-4 h-4 text-black" />
            </button>
          </div>

          <div className="flex-1 p-3 overflow-auto">
            <div
              ref={newEditorRef}
              className="rich-editor bg-yellow-100 border border-yellow-300 rounded p-2 text-sm text-black overflow-auto min-h-[100px]"
              contentEditable
              suppressContentEditableWarning
            />
          </div>

          <div className="flex gap-2 p-2">
            <button onClick={addNote} className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
              <Save className="w-4 h-4" /> Save
            </button>
            <button onClick={() => setShowNoteForm(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm">
              Cancel
            </button>
          </div>

          {/* Resize handle */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize no-drag"
            onMouseDown={(e) => handleResizeStart(e, 'new-note', 'bottom-right')}
          >
            <div className="w-2 h-2 bg-yellow-400 absolute bottom-1 right-1 rotate-45" />
          </div>
        </div>
      )}

      {/* Existing Notes */}
      {notes.map((note) => (
        <div
          key={note.id}
          id={`note-${note.id}`}
          className="fixed bg-yellow-200 border-2 border-yellow-300 rounded-lg shadow-lg flex flex-col pointer-events-auto"
          style={{
            left: `${note.position.x}px`,
            top: `${note.position.y}px`,
            width: `${note.size?.width || 350}px`,
            height: `${note.size?.height || 300}px`,
            zIndex: 10000,
          }}
          onMouseDown={(e) => handleDragStart(e, note.id)}
        >
          <div className="flex items-center justify-between p-2 bg-yellow-300 border-b border-yellow-400 rounded-t-md cursor-move gap-2">
            <div className="flex items-center gap-2 flex-1">
              <GripVertical className="w-3 h-3 text-black" />
              <StickyNote className="w-3 h-3 text-black" />
              <span className="text-xs font-bold text-black truncate">{note.title || 'Untitled Note'}</span>
            </div>
            <button onClick={() => deleteNote(note.id)} title="Delete">
              <Trash2 className="w-3 h-3 text-red-600" />
            </button>
            <button onClick={() => setEditingNoteId(note.id)} title="Edit">
              <Edit3 className="w-3 h-3 text-black" />
            </button>

          </div>

          {editingNoteId === note.id ? (
            <div className="flex-1 flex flex-col pointer-events-auto no-drag">
              <div
                ref={(el) => {
                  if (el && el.innerHTML === '') {
                    el.innerHTML = editingNoteText || note.text || ''
                  }
                }}
                className="flex-1 bg-yellow-100 border border-yellow-300 rounded p-2 text-sm text-black overflow-auto outline-none"
                contentEditable
                suppressContentEditableWarning
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onInput={(e) => setEditingNoteText(e.currentTarget.innerHTML)}
              />
              <div className="flex gap-2 p-2">
                <button
                  onClick={() =>
                    updateNote(note.id, {
                      text: editingNoteText?.trim() ? editingNoteText : note.text,
                      title: note.title || 'Untitled Note',
                    })
                  }
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                  <Save className="w-4 h-4" /> Save
                </button>

                <button
                  onClick={() => {
                    setEditingNoteId(null)
                    setEditingNoteText('')
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              className="flex-1 p-2 overflow-y-auto text-sm text-black"
              dangerouslySetInnerHTML={{ __html: note.text }}
            />
          )}

          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={(e) => handleResizeStart(e, note.id, 'bottom-right')}
          >
            <div className="w-2 h-2 bg-yellow-400 absolute bottom-1 right-1 rotate-45" />
          </div>
        </div>
      ))}
    </div>
  )

  if (!portalEl) return null
  return createPortal(overlay, portalEl)
}
