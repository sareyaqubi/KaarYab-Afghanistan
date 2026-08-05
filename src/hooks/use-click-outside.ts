"use client";

import { useEffect, useRef, type RefObject } from "react";

export function useClickOutside<T extends HTMLElement = HTMLDivElement>(
  onOutside: () => void
): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutside();
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [onOutside]);

  return ref;
}
