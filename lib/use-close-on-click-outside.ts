import { useEffect, type RefObject } from "react";

// Closes a menu when the user presses anywhere outside it
export function useCloseOnClickOutside(
  ref: RefObject<HTMLElement | null>,
  isOpen: boolean,
  close: () => void,
) {
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        close();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [ref, isOpen, close]);
}
