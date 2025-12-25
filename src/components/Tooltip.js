'use client'
import { useRef } from 'react'
import propTypes from 'prop-types'

// Supported orientation keywords for tooltip placement.
const orientations = {
  right: 'right',
  top: 'top',
  left: 'left',
  bottom: 'bottom',
}

/**
 * Reveals the tooltip container when the trigger receives hover/focus.
 * @param {React.MutableRefObject<HTMLDivElement|null>} ref
 */
function handleMouseEnter(ref) {
  if (ref.current) {
    ref.current.style.opacity = 1
  }
}

/**
 * Hides the tooltip container when the trigger loses hover/focus.
 * @param {React.MutableRefObject<HTMLDivElement|null>} ref
 */
function handleMouseLeave(ref) {
  if (ref.current) {
    ref.current.style.opacity = 0
  }
}

/**
 * Maps the tooltip orientation to container positioning classes.
 * @param {'top'|'bottom'|'left'|'right'} orientation
 * @returns {string|undefined}
 */
const setContainerPosition = (orientation) => {
  let classnames

  switch (orientation) {
    case orientations.right:
      classnames = 'top-0 left-full ml-4'
      break
    case orientations.left:
      classnames = 'top-0 right-full mr-4'
      break
    case orientations.top:
      classnames = 'bottom-full left-[50%] translate-x-[-50%] -translate-y-2'
      break
    case orientations.bottom:
      classnames = 'top-full left-[50%] translate-x-[-50%] translate-y-2'
      break
    default:
      break
  }

  return classnames
}

/**
 * Maps the tooltip orientation to pointer positioning classes.
 * @param {'top'|'bottom'|'left'|'right'} orientation
 * @returns {string|undefined}
 */
const setPointerPosition = (orientation) => {
  let classnames

  switch (orientation) {
    case orientations.right:
      classnames = 'left-[-6px]'
      break
    case orientations.left:
      classnames = 'right-[-6px]'
      break
    case orientations.top:
      classnames = 'top-full left-[50%] translate-x-[-50%] -translate-y-2'
      break
    case orientations.bottom:
      classnames = 'bottom-full left-[50%] translate-x-[-50%] translate-y-2'
      break
    default:
      break
  }

  return classnames
}

/**
 * Lightweight tooltip wrapper that reveals translated helper text on hover/focus.
 * @param {object} props React props
 * @param {React.ReactNode} props.children Trigger element
 * @param {string} props.tooltipText Tooltip label
 * @param {'top'|'bottom'|'left'|'right'} [props.orientation]
 * @returns {JSX.Element}
 */
const Tooltip = ({ children, tooltipText, orientation = 'right' }) => {
  const tipRef = useRef(null)

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => handleMouseEnter(tipRef)}
      onMouseLeave={() => handleMouseLeave(tipRef)}
    >
      <div
        className={`w-max absolute z-10 ${setContainerPosition(orientation)} bg-gray-600 text-white text-sm px-2 py-1 rounded flex items-center transition-all duration-150 pointer-events-none`}
        style={{ opacity: 0 }}
        ref={tipRef}
        data-testid="tooltip-body"
      >
        <div
          className={`bg-gray-600 h-3 w-3 absolute z-10 ${setPointerPosition(
            orientation
          )} rotate-45 pointer-events-none`}
          data-testid="tooltip-pointer"
        />
        {tooltipText}
      </div>
      {children}
    </div>
  )
}

Tooltip.propTypes = {
  orientation: propTypes.oneOf(['top', 'left', 'right', 'bottom']),
  tooltipText: propTypes.string.isRequired,
}

export default Tooltip;