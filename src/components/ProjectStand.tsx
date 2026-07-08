"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { useExperienceStore } from "@/store/useExperienceStore";
import type { Project } from "@/lib/projects";

export function ProjectStand({ project }: { project: Project }) {
  const glowRef = useRef<THREE.Mesh>(null);
  const isNearby = useExperienceStore((s) => s.nearbyProjectId === project.id);

  useFrame((state) => {
    if (!glowRef.current) return;
    const material = glowRef.current.material as THREE.MeshStandardMaterial;
    const targetIntensity = isNearby ? 3.5 : 1.2;
    material.emissiveIntensity = THREE.MathUtils.lerp(
      material.emissiveIntensity,
      targetIntensity,
      0.1
    );
    glowRef.current.position.y =
      1.9 + Math.sin(state.clock.elapsedTime * 1.5 + project.position[0]) * 0.08;
    glowRef.current.rotation.y = state.clock.elapsedTime * (isNearby ? 1.4 : 0.5);
    glowRef.current.rotation.x = state.clock.elapsedTime * 0.3;
  });

  return (
    <group position={project.position}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.6, 0.7, 1, 6]} />
          <meshStandardMaterial color="#2a2a30" metalness={0.3} roughness={0.6} />
        </mesh>
      </RigidBody>

      <mesh ref={glowRef} position={[0, 1.9, 0]}>
        <icosahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial
          color={project.color}
          emissive={project.color}
          emissiveIntensity={0.6}
          metalness={0.4}
          roughness={0.2}
        />
      </mesh>

      <Text
        position={[0, 2.7, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {project.title}
      </Text>

      {isNearby && (
        <Text
          position={[0, 2.3, 0]}
          fontSize={0.16}
          color="#ffd166"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.015}
          outlineColor="#000000"
        >
          press E to view
        </Text>
      )}
    </group>
  );
}
