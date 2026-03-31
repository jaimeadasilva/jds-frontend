/**
 * useHoldPress — reliable hold-to-trigger using pointer events
 * Works on both mouse and touch
 */
import { useRef, useState, useCallback } from "react";

export function useHoldPress(onTrigger, ms = 700) {
  const [progress, setProgress] = useState(0);
  const rafRef   = useRef(null);
  const startRef = useRef(null);
  const activeRef = useRef(false);

  const start = useCallback((e) => {
    // Don't steal the event — just start the timer
    activeRef.current = true;
    startRef.current  = Date.now();

    const tick = () => {
      if (!activeRef.current) return;
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min(100, (elapsed / ms) * 100);
      setProgress(pct);
      if (elapsed >= ms) {
        activeRef.current = false;
        setProgress(0);
        onTrigger();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [onTrigger, ms]);

  const cancel = useCallback(() => {
    activeRef.current = false;
    cancelAnimationFrame(rafRef.current);
    setProgress(0);
  }, []);

  return {
    progress,
    handlers: {
      onPointerDown:  start,
      onPointerUp:    cancel,
      onPointerLeave: cancel,
      onPointerCancel:cancel,
    },
  };
}
