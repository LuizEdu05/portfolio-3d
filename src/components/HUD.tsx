"use client";

import { useExperienceStore } from "@/store/useExperienceStore";

export function HUD() {
  const started = useExperienceStore((s) => s.started);
  const locked = useExperienceStore((s) => s.locked);
  const start = useExperienceStore((s) => s.start);
  const nearbyProjectId = useExperienceStore((s) => s.nearbyProjectId);
  const activeProjectId = useExperienceStore((s) => s.activeProjectId);

  if (activeProjectId) return null;

  if (!started || !locked) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 text-center text-white cursor-pointer"
        onClick={() => {
          start();
          document.querySelector("canvas")?.requestPointerLock();
        }}
      >
        <h1 className="text-3xl font-semibold tracking-tight">Portfólio 3D</h1>
        <p className="max-w-sm text-sm text-zinc-300">
          Clique para entrar. WASD para mover, mouse para olhar em volta, E
          para abrir um projeto.
        </p>
        <span className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black">
          Clique para começar
        </span>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80" />
      {nearbyProjectId && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 rounded-md bg-black/60 px-4 py-2 text-sm text-white">
          Pressione <span className="font-semibold">E</span> para ver detalhes
        </div>
      )}
    </div>
  );
}
