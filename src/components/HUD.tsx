"use client";

import { useExperienceStore } from "@/store/useExperienceStore";
import { useIsTouch } from "@/hooks/useIsTouch";
import { TouchControls } from "@/components/TouchControls";

export function HUD() {
  const started = useExperienceStore((s) => s.started);
  const locked = useExperienceStore((s) => s.locked);
  const start = useExperienceStore((s) => s.start);
  const setLocked = useExperienceStore((s) => s.setLocked);
  const nearbyProjectId = useExperienceStore((s) => s.nearbyProjectId);
  const activeProjectId = useExperienceStore((s) => s.activeProjectId);
  const isTouch = useIsTouch();

  if (activeProjectId) return null;

  if (!started || !locked) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 text-center text-white cursor-pointer"
        onClick={() => {
          start();
          if (isTouch) {
            setLocked(true);
          } else {
            document.querySelector("canvas")?.requestPointerLock();
          }
        }}
      >
        <h1 className="text-3xl font-semibold tracking-tight">Portfólio 3D</h1>
        <p className="max-w-sm text-sm text-zinc-300">
          {isTouch
            ? "Toque para entrar. Arraste a tela para olhar em volta, use o manche pra mover e toque em Abrir perto de um projeto."
            : "Clique para entrar. WASD para mover, mouse para olhar em volta, E para abrir um projeto."}
        </p>
        <span className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black">
          {isTouch ? "Toque para começar" : "Clique para começar"}
        </span>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      {!isTouch && (
        <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80" />
      )}
      {nearbyProjectId && !isTouch && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 rounded-md bg-black/60 px-4 py-2 text-sm text-white">
          Pressione <span className="font-semibold">E</span> para ver detalhes
        </div>
      )}
      {isTouch && <TouchControls />}
    </div>
  );
}
