'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { StickyNote, X, Save, Trash2, Edit3, Bold, Italic, List, GripVertical } from 'lucide-react'
import { getNotes, saveNotes } from '../utils/storage'

export default function NotesComponent({ sectionSlug: propSectionSlug, currentPage }) {
  console.log("NotesComponent loaded for sectionSlug =", propSectionSlug)

  // Resolve slug from prop or URL so it persists even if prop isn't passed
  const [resolvedSlug, setResolvedSlug] = useState(propSectionSlug || '')
  useEffect(() => {
    if (propSectionSlug) {
      setResolvedSlug(propSectionSlug)
      return
    }
    if (typeof window !== 'undefined') {
      const m = window.location.pathname.match(/\/interactive\/section\/([^/]+)/i)
      if (m?.[1]) setResolvedSlug(decodeURIComponent(m[1]))
    }
  }, [propSectionSlug])

  // Notes state
  const [notes, setNotes] = useState([])
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [newNoteText, setNewNoteText] = useState('')
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [editingNoteId, setEditingNoteId] = useState(null)
  const [notePosition, setNotePosition] = useState({ x: 100, y: 100 })
  const [draggedNote, setDraggedNote] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [resizingNote, setResizingNote] = useState(null)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [editingNoteText, setEditingNoteText] = useState('')
  const [editingNoteTitle, setEditingNoteTitle] = useState('')
  const [isBoldActive, setIsBoldActive] = useState(false)
  const [isItalicActive, setIsItalicActive] = useState(false)
  const [isUnderlineActive, setIsUnderlineActive] = useState(false)

  // Rich editor refs
  const newEditorRef = useRef(null)
  const savedSelectionRef = useRef(null)
  const activeEditorRef = useRef(null)

  const [portalEl, setPortalEl] = useState(null)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const doc = window.top?.document || document
    let el = doc.getElementById('notes-portal')
    if (!el) {
      el = doc.createElement('div')
      el.id = 'notes-portal'
      doc.body.appendChild(el)
    }

    Object.assign(el.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      overflow: 'visible',
      zIndex: '2147483647',
      pointerEvents: 'none',
      transform: 'none',
    })

    setPortalEl(el)
  }, [])


const [notesLoaded, setNotesLoaded] = useState(false)

useEffect(() => {
  if (!resolvedSlug) return
  const stored = getNotes(resolvedSlug)
  console.log("Loaded notes for", resolvedSlug, stored)
  setNotes(stored)
  setNotesLoaded(true)
}, [resolvedSlug])

// Save notes (only after load)
useEffect(() => {
  if (!resolvedSlug || !notesLoaded) return
  saveNotes(resolvedSlug, notes)
}, [notes, resolvedSlug, notesLoaded])

  // Save just before unload/navigation
useEffect(() => {
  const handler = () => {
    if (!resolvedSlug || !notesLoaded) return
    saveNotes(resolvedSlug, notes)
  }
  window.addEventListener('beforeunload', handler)
  return () => window.removeEventListener('beforeunload', handler)
}, [notes, resolvedSlug, notesLoaded])


  // Paragraph behavior for execCommand
  useEffect(() => {
    try { document.execCommand('defaultParagraphSeparator', false, 'div') } catch {}
  }, [])

  // Clamp a position to viewport (so notes always visible)
  const clampToViewport = (x, y, width = 350, height = 300) => {
    const maxX = Math.max(0, (window.innerWidth || 0) - (width + 10))
    const maxY = Math.max(0, (window.innerHeight || 0) - (height + 10))
    return { x: Math.min(Math.max(10, x), maxX), y: Math.min(Math.max(10, y), maxY) }
  }

  // Add new
  const addNote = () => {
    const html = (newEditorRef.current?.innerHTML || newNoteText || '').trim()
    if (!html || !resolvedSlug) return
    const pos = clampToViewport(notePosition.x, notePosition.y, 350, 300)
    const newNote = {
      id: Date.now(),
      title: newNoteTitle.trim() || 'Untitled Note',
      text: html,
      timestamp: new Date().toISOString(),
      position: pos,
      size: { width: 350, height: 300 },
      page: currentPage,
    }
    setNotes(prev => {
      const next = [...prev, newNote]
      saveNotes(resolvedSlug, next)
      return next
    })
    setNewNoteText('')
    setNewNoteTitle('')
    setShowNoteForm(false)
    setNotePosition(prev => clampToViewport(prev.x + 30, prev.y + 30, 350, 300))
    if (newEditorRef.current) newEditorRef.current.innerHTML = ''
  }

  const updateNote = (noteId, updates) => {
    setNotes(prev => {
      const next = prev.map(note =>
        note.id === noteId ? { ...note, ...updates, timestamp: new Date().toISOString() } : note
      )
      saveNotes(resolvedSlug, next)
      return next
    })
    setEditingNoteId(null)
    setEditingNoteText('')
    setEditingNoteTitle('')
  }

  const deleteNote = (noteId) => {
    setNotes(prev => {
      const next = prev.filter(n => n.id !== noteId)
      saveNotes(resolvedSlug, next)
      return next
    })
  }

  const startEdit = (noteId) => {
    const note = notes.find(n => n.id === noteId)
    if (!note) return
    setEditingNoteId(noteId)
    setEditingNoteText(note.text || '')
    setEditingNoteTitle(note.title || '')
  }

  // Drag / Resize logic 
  const handleDragStart = (e, noteId) => {
    if (e.target.closest('.no-drag')) return
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    setDraggedNote(noteId)
    setIsDragging(true)
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleDragMove = (e) => {
    if (!(draggedNote && isDragging)) return
    e.preventDefault()
    const note = draggedNote === 'new-note'
      ? { size: { width: 350, height: 300 } }
      : notes.find(n => n.id === draggedNote) || { size: { width: 350, height: 300 } }

    const w = note.size?.width || 350
    const h = note.size?.height || 300

    const proposedX = e.clientX - dragOffset.x
    const proposedY = e.clientY - dragOffset.y
    const { x: newX, y: newY } = clampToViewport(proposedX, proposedY, w, h)

    if (draggedNote === 'new-note') {
      setNotePosition({ x: newX, y: newY })
    } else {
      setNotes(prev => {
        const next = prev.map(n =>
          n.id === draggedNote ? { ...n, position: { x: newX, y: newY } } : n
        )
        saveNotes(resolvedSlug, next)
        return next
      })
    }
  }

  const handleDragEnd = () => {
    setDraggedNote(null)
    setIsDragging(false)
  }

  // Resize
  const handleResizeStart = (e, noteId, corner) => {
    e.preventDefault()
    e.stopPropagation()
    const note = notes.find(n => n.id === noteId)
    if (!note && noteId !== 'new-note') return
    setResizingNote({ id: noteId, corner })
    const width = noteId === 'new-note' ? 350 : (note?.size?.width || 350)
    const height = noteId === 'new-note' ? 300 : (note?.size?.height || 300)
    setResizeStart({ x: e.clientX, y: e.clientY, width, height })
  }

  const handleResizeMove = (e) => {
    if (!resizingNote) return
    e.preventDefault()
    const deltaX = e.clientX - resizeStart.x
    const deltaY = e.clientY - resizeStart.y
    let newWidth = resizeStart.width
    let newHeight = resizeStart.height
    if (resizingNote.corner.includes('right')) newWidth = Math.max(280, resizeStart.width + deltaX)
    if (resizingNote.corner.includes('bottom')) newHeight = Math.max(250, resizeStart.height + deltaY)

    if (resizingNote.id === 'new-note') return

    setNotes(prev => {
      const next = prev.map(note =>
        note.id === resizingNote.id ? { ...note, size: { width: newWidth, height: newHeight } } : note
      )
      saveNotes(resolvedSlug, next) // live-persist
      return next
    })
  }

  const handleResizeEnd = () => setResizingNote(null)

  // Global move/up for drag & resize
  useEffect(() => {
    const move = (e) => { handleDragMove(e); handleResizeMove(e) }
    const up = () => { handleDragEnd(); handleResizeEnd() }
    if (isDragging || resizingNote) {
      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
      return () => {
        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
      }
    }
  }, [isDragging, resizingNote, dragOffset, resizeStart])

  // Form open (clamp initial position)
  const openNoteForm = () => {
    setShowNoteForm(true)
    setNotePosition(prev => clampToViewport(prev.x, prev.y, 350, 300))
  }

  // Selection / formatting helpers
  const saveSelection = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount) savedSelectionRef.current = sel.getRangeAt(0).cloneRange()
  }

  const restoreSelection = (editor) => {
    if (!editor) return
    const sel = window.getSelection()
    if (!sel) return
    editor.focus()
    if (savedSelectionRef.current) {
      try { sel.removeAllRanges(); sel.addRange(savedSelectionRef.current) } catch { editor.focus() }
    }
  }

  const getElementForClosest = (node) =>
    node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement

  const toggleBulletList = (editor) => {
    if (!editor) return
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) {
      const ul = document.createElement('ul')
      const li = document.createElement('li')
      li.innerHTML = '<br>'
      ul.appendChild(li)
      ul.style.listStyle = 'disc'
      ul.style.marginLeft = '1.25rem'
      ul.style.paddingLeft = '1.25rem'
      editor.appendChild(ul)
      const range = document.createRange()
      range.setStart(li, 0)
      range.collapse(true)
      sel?.removeAllRanges()
      sel?.addRange(range)
      return
    }

    const range = sel.getRangeAt(0)
    const anchorEl = getElementForClosest(sel.anchorNode)
    const liHere = anchorEl?.closest('li')
    const ulHere = anchorEl?.closest('ul')

    if (ulHere && liHere) {
      const fragment = document.createDocumentFragment()
      Array.from(ulHere.children).forEach((child) => {
        if (child.tagName === 'LI') {
          const div = document.createElement('div')
          div.innerHTML = child.innerHTML || '<br>'
          fragment.appendChild(div)
        }
      })
      ulHere.replaceWith(fragment)
      const firstDiv = fragment.firstChild
      if (firstDiv) {
        const newRange = document.createRange()
        newRange.selectNodeContents(firstDiv)
        newRange.collapse(false)
        sel.removeAllRanges()
        sel.addRange(newRange)
      }
      return
    }

    const selected = range.extractContents()
    const ul = document.createElement('ul')
    const li = document.createElement('li')
    if (selected.textContent.trim()) li.appendChild(selected)
    else li.innerHTML = '<br>'
    ul.appendChild(li)
    ul.style.listStyle = 'disc'
    ul.style.marginLeft = '1.25rem'
    ul.style.paddingLeft = '1.25rem'
    range.insertNode(ul)
    const newRange = document.createRange()
    newRange.setStart(li, li.childNodes.length)
    newRange.collapse(true)
    sel.removeAllRanges()
    sel.addRange(newRange)
  }

  const execFormat = (command, isEditing = false, noteId = null) => {
    const editor = isEditing
      ? document.querySelector(`#note-${noteId} .rich-editor`)
      : newEditorRef.current
    if (!editor) return
    activeEditorRef.current = editor

    if (command.startsWith('color:')) {
      restoreSelection(editor)
      const color = command.split(':')[1]
      try { document.execCommand('foreColor', false, color) } catch {}
    } else if (command === 'bullet') {
      toggleBulletList(editor)
    } else if (['bold', 'italic', 'underline'].includes(command)) {
      editor.focus()
      try { document.execCommand(command) } catch {}
    }

    setTimeout(() => {
      try {
        setIsBoldActive(document.queryCommandState('bold'))
        setIsItalicActive(document.queryCommandState('italic'))
        setIsUnderlineActive(document.queryCommandState('underline'))
      } catch {}
    }, 10)
  }

  const handleEditorKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      try { document.execCommand(e.shiftKey ? 'outdent' : 'indent') } catch {}
    } else if (e.key === 'Enter') {
      const sel = window.getSelection()
      if (sel && sel.anchorNode) {
        const el = getElementForClosest(sel.anchorNode)
        const li = el?.closest('li')
        if (li && li.textContent.trim() === '') {
          e.preventDefault()
          const ul = li.parentNode
          const div = document.createElement('div')
          div.innerHTML = '<br>'
          ul.parentNode.insertBefore(div, ul.nextSibling)
          li.remove()
          const range = document.createRange()
          range.setStart(div, 0)
          range.collapse(true)
          sel.removeAllRanges()
          sel.addRange(range)
        }
      }
    }
  }

  // ---------- UI ----------
  const overlay = (
    <div
    id="notes-overlay-root"
    className="fixed inset-0 pointer-events-none z-[2147483647]"
    style={{ position: 'fixed', top: 0, left: 0 }}
  >
      <style jsx global>{`
        .rich-editor ul { list-style: disc; margin-left: 1.25rem; padding-left: 1.25rem; }
        .rich-editor ol { list-style: decimal; margin-left: 1.25rem; padding-left: 1.25rem; }
        .rich-editor li { margin: 0.15rem 0; }
      `}</style>

      {/* Floating add button */}
      <button
        onClick={openNoteForm}
        className="fixed bottom-8 right-8 bg-yellow-400 hover:bg-yellow-500 text-black p-4 rounded-full shadow-lg transition-all duration-200 z-[10000]"
        title="Add Note"
      >
        <StickyNote className="w-6 h-6 text-black" />
        {notes.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {notes.length}
          </span>
        )}
      </button>

      {/* New Note */}
      {showNoteForm && (
        <div
          className="fixed bg-yellow-200 border-2 border-yellow-300 rounded-lg shadow-lg z-[10000] flex flex-col"
          style={{ left: `${notePosition.x}px`, top: `${notePosition.y}px`, width: '350px', height: '300px' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-3 bg-yellow-300 rounded-t-md cursor-move border-b border-yellow-400 flex-shrink-0"
            onMouseDown={(e) => handleDragStart(e, 'new-note')}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <GripVertical className="w-4 h-4 text-black" />
              <StickyNote className="w-4 h-4 text-black" />
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Note title..."
                className="w-full p-1 bg-yellow-200 rounded text-sm font-medium text-black placeholder-black/70 focus:outline-none no-drag"
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
            <button onClick={() => setShowNoteForm(false)} className="text-black hover:opacity-80 no-drag" title="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-3 flex flex-col flex-1 no-drag min-h-0">
            {/* Toolbar */}
            <div className="flex gap-1 mb-3 p-2 bg-yellow-100 rounded flex-shrink-0 items-center">
              <button onMouseDown={(e) => { e.preventDefault(); execFormat('bold', false); }}
                className={`p-2 rounded text-xs text-black ${isBoldActive ? 'bg-yellow-400' : 'hover:bg-yellow-300'}`}
                title="Bold"><Bold className="w-4 h-4" /></button>
              <button onMouseDown={(e) => { e.preventDefault(); execFormat('italic', false); }}
                className={`p-2 rounded text-xs text-black ${isItalicActive ? 'bg-yellow-400' : 'hover:bg-yellow-300'}`}
                title="Italic"><Italic className="w-4 h-4" /></button>
              <button onMouseDown={(e) => { e.preventDefault(); execFormat('underline', false); }}
                className={`p-2 rounded text-xs text-black ${isUnderlineActive ? 'bg-yellow-400' : 'hover:bg-yellow-300'}`}
                title="Underline"><u className="font-bold">U</u></button>
              <button onMouseDown={(e) => { e.preventDefault(); execFormat('bullet', false); }}
                className="p-2 hover:bg-yellow-300 rounded text-xs text-black" title="Bullet Point">
                <List className="w-4 h-4" />
              </button>
              <label className="p-1 rounded hover:bg-yellow-300 cursor-pointer relative top-[1px]" title="Font Color">
                <input type="color" onMouseDown={saveSelection}
                  onChange={(e) => execFormat(`color:${e.target.value}`, false)}
                  className="w-5 h-5 border-0 p-0 cursor-pointer" />
              </label>
            </div>

            {/* Rich Editor */}
            <div
              ref={(el) => { newEditorRef.current = el; if (el) activeEditorRef.current = el; }}
              className="rich-editor flex-1 p-3 bg-yellow-100 border border-yellow-300 rounded text-sm text-black min-h-0 overflow-auto"
              contentEditable
              suppressContentEditableWarning
              onFocus={(e) => { activeEditorRef.current = e.currentTarget }}
              onBlur={(e) => setNewNoteText(e.currentTarget.innerHTML)}
              onKeyDown={(e) => { handleEditorKeyDown(e); if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); addNote() } }}
            />

            {/* Actions */}
            <div className="flex gap-2 mt-3 flex-shrink-0">
              <button onClick={addNote}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm flex items-center gap-1">
                <Save className="w-4 h-4" /> Save
              </button>
              <button onClick={() => setShowNoteForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">
                Cancel
              </button>
            </div>
          </div>

          {/* Resize handle */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize no-drag"
            onMouseDown={(e) => handleResizeStart(e, 'new-note', 'bottom-right')}
          >
            <div className="w-2 h-2 bg-yellow-400 absolute bottom-1 right-1 rotate-45"></div>
          </div>
        </div>
      )}

      {/* Existing Notes */}
      {notes.map((note) => (
        <div
          key={note.id}
          id={`note-${note.id}`}
          className="fixed bg-yellow-200 border-2 border-yellow-300 rounded-lg shadow-lg z-[10000] flex flex-col"
          style={{
            left: `${note.position.x}px`,
            top: `${note.position.y}px`,
            width: `${note.size?.width || 350}px`,
            height: `${note.size?.height || 300}px`
          }}
          onDoubleClick={() => startEdit(note.id)}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-2 bg-yellow-300 rounded-t-md cursor-move border-b border-yellow-400 flex-shrink-0"
            onMouseDown={(e) => handleDragStart(e, note.id)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <GripVertical className="w-3 h-3 text-black flex-shrink-0" />
              <StickyNote className="w-3 h-3 text-black flex-shrink-0" />
              {editingNoteId === note.id ? (
                <input
                  type="text"
                  value={editingNoteTitle}
                  onChange={(e) => setEditingNoteTitle(e.target.value)}
                  className="w-full p-1 bg-yellow-300 rounded text-xs font-medium text-black focus:outline-none no-drag"
                  onMouseDown={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="text-xs font-medium text-black truncate">
                  {note.title || 'Untitled Note'}
                </span>
              )}
            </div>
            <div className="flex gap-1 no-drag">
              <button onClick={() => startEdit(note.id)} className="text-black hover:opacity-80 p-1" title="Edit note">
                <Edit3 className="w-3 h-3" />
              </button>
              <button onClick={() => deleteNote(note.id)} className="text-black hover:text-red-700 p-1" title="Delete note">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 flex flex-col flex-1 no-drag min-h-0">
            {editingNoteId === note.id ? (
              <>
                <div className="flex gap-1 mb-3 p-2 bg-yellow-100 rounded flex-shrink-0 items-center">
                  <button onMouseDown={(e) => { e.preventDefault(); execFormat('bold', true, note.id); }}
                    className={`p-2 rounded text-xs text-black ${isBoldActive ? 'bg-yellow-400' : 'hover:bg-yellow-300'}`}
                    title="Bold"><Bold className="w-4 h-4" /></button>
                  <button onMouseDown={(e) => { e.preventDefault(); execFormat('italic', true, note.id); }}
                    className={`p-2 rounded text-xs text-black ${isItalicActive ? 'bg-yellow-400' : 'hover:bg-yellow-300'}`}
                    title="Italic"><Italic className="w-4 h-4" /></button>
                  <button onMouseDown={(e) => { e.preventDefault(); execFormat('underline', true, note.id); }}
                    className={`p-2 rounded text-xs text-black ${isUnderlineActive ? 'bg-yellow-400' : 'hover:bg-yellow-300'}`}
                    title="Underline"><u className="font-bold">U</u></button>
                  <button onMouseDown={(e) => { e.preventDefault(); execFormat('bullet', true, note.id); }}
                    className="p-2 hover:bg-yellow-300 rounded text-xs text-black" title="Bullet Point">
                    <List className="w-4 h-4" />
                  </button>
                  <label className="p-1 rounded hover:bg-yellow-300 cursor-pointer relative top-[1px]" title="Font Color">
                    <input type="color" onMouseDown={saveSelection}
                      onChange={(e) => execFormat(`color:${e.target.value}`, true, note.id)}
                      className="w-5 h-5 border-0 p-0 cursor-pointer" />
                  </label>
                </div>

                <div
                  className="rich-editor flex-1 p-3 bg-yellow-100 border border-yellow-300 rounded text-sm text-black min-h-0 overflow-auto"
                  contentEditable
                  suppressContentEditableWarning
                  dangerouslySetInnerHTML={{ __html: editingNoteText || '' }}
                  onFocus={(e) => { activeEditorRef.current = e.currentTarget }}
                  onBlur={(e) => setEditingNoteText(e.currentTarget.innerHTML)}
                  onKeyDown={(e) => {
                    handleEditorKeyDown(e)
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault()
                      const editor = document.querySelector(`#note-${note.id} .rich-editor`)
                      updateNote(note.id, {
                        text: editor?.innerHTML || e.currentTarget.innerHTML,
                        title: editingNoteTitle || 'Untitled Note'
                      })
                    } else if (e.key === 'Escape') {
                      setEditingNoteId(null)
                      setEditingNoteText('')
                      setEditingNoteTitle('')
                    }
                  }}
                />

                <div className="flex gap-2 mt-3 flex-shrink-0">
                  <button
                    onClick={() => {
                      const editor = document.querySelector(`#note-${note.id} .rich-editor`)
                      updateNote(note.id, {
                        text: editor?.innerHTML || editingNoteText,
                        title: editingNoteTitle || 'Untitled Note'
                      })
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setEditingNoteId(null); setEditingNoteText(''); setEditingNoteTitle(''); }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto min-h-0">
                <div
                  className="text-sm text-black leading-relaxed pb-2"
                  dangerouslySetInnerHTML={{ __html: (note.text || '') }}
                />
              </div>
            )}
          </div>

          {/* Resize handle */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize no-drag"
            onMouseDown={(e) => handleResizeStart(e, note.id, 'bottom-right')}
          >
            <div className="w-2 h-2 bg-yellow-400 absolute bottom-1 right-1 rotate-45"></div>
          </div>
        </div>
      ))}
    </div>
  )

  // Render overlay into portal so it's truly viewport-fixed
  if (!portalEl) return null
  return createPortal(overlay, portalEl)
}
