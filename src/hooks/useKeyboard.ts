import { useEffect, useRef } from "react";

const KEYS = ["KeyW", "KeyA", "KeyS", "KeyD", "Space", "KeyE", "ShiftLeft"] as const;
export type KeyName = (typeof KEYS)[number];

export function useKeyboard() {
  const keys = useRef<Record<KeyName, boolean>>({
    KeyW: false,
    KeyA: false,
    KeyS: false,
    KeyD: false,
    Space: false,
    KeyE: false,
    ShiftLeft: false,
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((KEYS as readonly string[]).includes(e.code)) {
        keys.current[e.code as KeyName] = true;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if ((KEYS as readonly string[]).includes(e.code)) {
        keys.current[e.code as KeyName] = false;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return keys;
}
