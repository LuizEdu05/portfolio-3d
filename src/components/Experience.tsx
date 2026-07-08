"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { World } from "@/components/World";
import { Player } from "@/components/Player";
import { ProjectStand } from "@/components/ProjectStand";
import { projects } from "@/lib/projects";

export function Experience() {
  return (
    <Canvas
      dpr={1}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      camera={{ fov: 75, near: 0.1, far: 100, position: [0, 1.6, 6] }}
    >
      <Suspense fallback={null}>
        <Physics gravity={[0, -20, 0]}>
          <World />
          <Player />
          {projects.map((project) => (
            <ProjectStand key={project.id} project={project} />
          ))}
        </Physics>
      </Suspense>
    </Canvas>
  );
}
