/**
 * useHoldPress — fires callback after holding for `ms` milliseconds
 * Returns { handlers } to spread on a button element
 * Shows a fill animation during the hold
 */
import { useRef, useState, useCallback } from "react";

export function useHoldPress(onTrigger, ms = 800) {
  const timerRef    = useRef(null);
  const [progress, setProgress] = useState(0);
  const rafRef      = useRef(null);
  const startRef    = useRef(null);

  const start = useCallback((e) => {
    e.preventDefault();
    startRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min(100, (elapsed / ms) * 100);
      setProgress(pct);
      if (elapsed >= ms) { onTrigger(); setProgress(0); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [onTrigger, ms]);

  const cancel = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setProgress(0);
  }, []);

  return {
    progress,
    handlers: {
      onMouseDown:   start,
      onMouseUp:     cancel,
      onMouseLeave:  cancel,
      onTouchStart:  start,
      onTouchEnd:    cancel,
      onTouchCancel: cancel,
    },
  };
}
