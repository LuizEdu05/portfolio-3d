"use client";

import { useEffect } from "react";
import { useExperienceStore } from "@/store/useExperienceStore";
import { projects } from "@/lib/projects";

export function ProjectModal() {
  const activeProjectId = useExperienceStore((s) => s.activeProjectId);
  const closeProject = useExperienceStore((s) => s.closeProject);
  const project = projects.find((p) => p.id === activeProjectId);

  useEffect(() => {
    if (!project) return;
    document.exitPointerLock?.();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape") closeProject();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [project, closeProject]);

  if (!project) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-900 p-6 text-white shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold" style={{ color: project.color }}>
            {project.title}
          </h2>
          <button
            onClick={closeProject}
            className="rounded-full px-2 py-1 text-zinc-400 hover:bg-white/10 hover:text-white"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <p className="mb-4 text-sm text-zinc-300">{project.description}</p>
        <div className="mb-5 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-200"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="flex gap-3">
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
            >
              Ver demo
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white"
            >
              Repositório
            </a>
          )}
        </div>
        <p className="mt-4 text-xs text-zinc-500">Esc para fechar e continuar explorando</p>
      </div>
    </div>
  );
}
