import { useRef, useCallback } from 'react'
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from 'react'

const DRAG_THRESHOLD_PX = 4

/** Click-and-drag horizontal scrolling for a container with `overflow-x-auto`,
 *  in place of a visible scrollbar. Suppresses the click on whatever was
 *  dragged over so a drag doesn't also trigger navigation. */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const drag = useRef({ isDown: false, startX: 0, startScrollLeft: 0, dragged: false, pointerId: 0 })

  const onPointerDown = useCallback((e: ReactPointerEvent<T>) => {
    const el = ref.current
    if (!el) return
    drag.current = {
      isDown: true,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      dragged: false,
      pointerId: e.pointerId,
    }
  }, [])

  const onPointerMove = useCallback((e: ReactPointerEvent<T>) => {
    const el = ref.current
    if (!el || !drag.current.isDown) return
    const delta = e.clientX - drag.current.startX
    if (Math.abs(delta) > DRAG_THRESHOLD_PX) {
      // Only capture once an actual drag is confirmed — capturing eagerly on
      // pointerdown retargets the click's endpoint to this container, which
      // silently swallows plain (non-dragging) clicks on cards inside it.
      if (!drag.current.dragged) {
        el.setPointerCapture(drag.current.pointerId)
      }
      drag.current.dragged = true
    }
    el.scrollLeft = drag.current.startScrollLeft - delta
  }, [])

  const endDrag = useCallback(() => {
    drag.current.isDown = false
  }, [])

  const onClickCapture = useCallback((e: ReactMouseEvent<T>) => {
    if (drag.current.dragged) {
      e.stopPropagation()
      e.preventDefault()
      drag.current.dragged = false
    }
  }, [])

  return {
    ref,
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerLeave: endDrag,
    onPointerCancel: endDrag,
    onClickCapture,
  }
}
