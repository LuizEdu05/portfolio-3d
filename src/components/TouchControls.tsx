"use client";

import { useRef } from "react";
import { touchInput } from "@/lib/touchInput";
import { useExperienceStore } from "@/store/useExperienceStore";

const JOYSTICK_RADIUS = 50;

function TouchJoystick() {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const touchId = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0 });

  const setKnob = (dx: number, dy: number) => {
    knobRef.current?.style.setProperty("transform", `translate(${dx}px, ${dy}px)`);
  };

  const findTouch = (e: React.TouchEvent) =>
    Array.from(e.changedTouches).find((t) => t.identifier === touchId.current);

  const handleStart = (e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    touchId.current = t.identifier;
    const rect = baseRef.current!.getBoundingClientRect();
    origin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };

  const handleMove = (e: React.TouchEvent) => {
    const t = findTouch(e);
    if (!t) return;
    e.preventDefault();
    let dx = t.clientX - origin.current.x;
    let dy = t.clientY - origin.current.y;
    const dist = Math.hypot(dx, dy);
    if (dist > JOYSTICK_RADIUS) {
      dx = (dx / dist) * JOYSTICK_RADIUS;
      dy = (dy / dist) * JOYSTICK_RADIUS;
    }
    setKnob(dx, dy);
    touchInput.move.x = dx / JOYSTICK_RADIUS;
    touchInput.move.y = dy / JOYSTICK_RADIUS;
  };

  const handleEnd = (e: React.TouchEvent) => {
    if (!findTouch(e)) return;
    touchId.current = null;
    touchInput.move.x = 0;
    touchInput.move.y = 0;
    setKnob(0, 0);
  };

  return (
    <div
      ref={baseRef}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      style={{ touchAction: "none" }}
      className="pointer-events-auto absolute bottom-10 left-10 h-28 w-28 rounded-full border border-white/20 bg-white/5"
    >
      <div
        ref={knobRef}
        className="pointer-events-none absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40"
      />
    </div>
  );
}

function TouchLookLayer() {
  const touchId = useRef<number | null>(null);
  const last = useRef({ x: 0, y: 0 });

  const findTouch = (e: React.TouchEvent) =>
    Array.from(e.changedTouches).find((t) => t.identifier === touchId.current);

  const handleStart = (e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    touchId.current = t.identifier;
    last.current = { x: t.clientX, y: t.clientY };
  };

  const handleMove = (e: React.TouchEvent) => {
    const t = findTouch(e);
    if (!t) return;
    e.preventDefault();
    touchInput.look.x += t.clientX - last.current.x;
    touchInput.look.y += t.clientY - last.current.y;
    last.current = { x: t.clientX, y: t.clientY };
  };

  const handleEnd = (e: React.TouchEvent) => {
    if (!findTouch(e)) return;
    touchId.current = null;
  };

  return (
    <div
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
      style={{ touchAction: "none" }}
      className="pointer-events-auto absolute inset-0"
    />
  );
}

function InteractButton() {
  const nearbyProjectId = useExperienceStore((s) => s.nearbyProjectId);
  const openProject = useExperienceStore((s) => s.openProject);

  if (!nearbyProjectId) return null;

  return (
    <button
      onTouchStart={(e) => {
        e.stopPropagation();
        openProject(nearbyProjectId);
      }}
      className="pointer-events-auto absolute bottom-36 right-10 h-16 w-16 rounded-full border border-white/30 bg-white/15 text-sm font-medium text-white active:bg-white/30"
      style={{ touchAction: "none" }}
    >
      Abrir
    </button>
  );
}

function JumpButton() {
  return (
    <button
      onTouchStart={(e) => {
        e.stopPropagation();
        touchInput.jump = true;
      }}
      onTouchEnd={(e) => {
        e.stopPropagation();
        touchInput.jump = false;
      }}
      onTouchCancel={() => {
        touchInput.jump = false;
      }}
      className="pointer-events-auto absolute bottom-10 right-10 h-20 w-20 rounded-full border border-white/30 bg-white/10 text-sm font-medium text-white active:bg-white/25"
      style={{ touchAction: "none" }}
    >
      Pular
    </button>
  );
}

export function TouchControls() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <TouchLookLayer />
      <TouchJoystick />
      <JumpButton />
      <InteractButton />
    </div>
  );
}
