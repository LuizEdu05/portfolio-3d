"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { Grid } from "@react-three/drei";
import * as THREE from "three";

const ARENA_SIZE = 24;
const WALL_HEIGHT = 6;
const DUST_COUNT = 200;
const GALAXY_COUNT = 2200;
const GALAXY_RADIUS = 70;

function Galaxy() {
  const pointsRef = useRef<THREE.Points>(null);
  const [positions, colors, sizes] = useMemo(() => {
    const pos = new Float32Array(GALAXY_COUNT * 3);
    const col = new Float32Array(GALAXY_COUNT * 3);
    const siz = new Float32Array(GALAXY_COUNT);
    const white = new THREE.Color("#f2f2f5");
    const gray = new THREE.Color("#8c8c96");
    const yellow = new THREE.Color("#ffd166");

    for (let i = 0; i < GALAXY_COUNT; i++) {
      const r = GALAXY_RADIUS * (0.65 + Math.random() * 0.35);
      const theta = Math.acos(1 - 2 * Math.random());
      const phi = Math.random() * Math.PI * 2;
      pos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
      pos[i * 3 + 1] = Math.abs(r * Math.cos(theta)) + 4;
      pos[i * 3 + 2] = r * Math.sin(theta) * Math.sin(phi);

      const roll = Math.random();
      const c = roll < 0.1 ? yellow : roll < 0.55 ? gray : white;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;

      siz[i] = 0.4 + Math.random() * 1.1;
    }
    return [pos, col, siz];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.004;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.5}
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Dust() {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(DUST_COUNT * 3);
    for (let i = 0; i < DUST_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * ARENA_SIZE;
      arr[i * 3 + 1] = Math.random() * WALL_HEIGHT;
      arr[i * 3 + 2] = (Math.random() - 0.5) * ARENA_SIZE;
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.015;
    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const rise = delta * 0.15;
    for (let i = 1; i < arr.length; i += 3) {
      arr[i] += rise;
      if (arr[i] > WALL_HEIGHT) arr[i] = 0;
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#8fb8ff" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

export function World() {
  return (
    <>
      <color attach="background" args={["#07070a"]} />
      <Galaxy />
      <Dust />
      <hemisphereLight args={["#6a8cff", "#1a1a1f", 0.6]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[10, 12, 6]} intensity={1.2} />

      <RigidBody type="fixed" colliders="cuboid">
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[ARENA_SIZE, ARENA_SIZE]} />
          <meshStandardMaterial color="#1a1a1f" />
        </mesh>
      </RigidBody>
      <Grid
        position={[0, 0.01, 0]}
        args={[ARENA_SIZE, ARENA_SIZE]}
        cellColor="#333"
        sectionColor="#555"
        fadeDistance={30}
        infiniteGrid={false}
      />

      {/* invisible boundary walls */}
      {[
        { position: [0, WALL_HEIGHT / 2, -ARENA_SIZE / 2] as const, args: [ARENA_SIZE, WALL_HEIGHT, 0.5] as const },
        { position: [0, WALL_HEIGHT / 2, ARENA_SIZE / 2] as const, args: [ARENA_SIZE, WALL_HEIGHT, 0.5] as const },
        { position: [-ARENA_SIZE / 2, WALL_HEIGHT / 2, 0] as const, args: [0.5, WALL_HEIGHT, ARENA_SIZE] as const },
        { position: [ARENA_SIZE / 2, WALL_HEIGHT / 2, 0] as const, args: [0.5, WALL_HEIGHT, ARENA_SIZE] as const },
      ].map((wall, i) => (
        <RigidBody key={i} type="fixed" position={wall.position} colliders="cuboid">
          <mesh visible={false}>
            <boxGeometry args={wall.args} />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
}
