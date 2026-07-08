"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import {
  RigidBody,
  CapsuleCollider,
  type RapierRigidBody,
} from "@react-three/rapier";
import * as THREE from "three";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useExperienceStore } from "@/store/useExperienceStore";
import { projects } from "@/lib/projects";

const MOVE_SPEED = 5;
const SPRINT_SPEED = 8;
const ACCEL = 14;
const EYE_HEIGHT = 1.6;
const PROXIMITY_RADIUS = 3.5;
const BASE_FOV = 75;
const SPRINT_FOV = 82;
const BOB_FREQ = 9;
const BOB_AMOUNT = 0.045;

export function Player() {
  const bodyRef = useRef<RapierRigidBody>(null);
  const { camera } = useThree();
  const keys = useKeyboard();
  const setLocked = useExperienceStore((s) => s.setLocked);
  const setNearbyProjectId = useExperienceStore((s) => s.setNearbyProjectId);
  const activeProjectId = useExperienceStore((s) => s.activeProjectId);
  const openProject = useExperienceStore((s) => s.openProject);

  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const wasPressingE = useRef(false);
  const bobTime = useRef(0);
  const currentFov = useRef(BASE_FOV);

  useFrame((_, delta) => {
    const body = bodyRef.current;
    if (!body) return;

    const t = body.translation();

    if (activeProjectId) {
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      camera.position.set(t.x, t.y + EYE_HEIGHT, t.z);
      return;
    }

    camera.getWorldDirection(forward.current);
    forward.current.y = 0;
    forward.current.normalize();
    right.current.crossVectors(forward.current, camera.up).normalize();

    const sprinting = keys.current.ShiftLeft;
    const speed = sprinting ? SPRINT_SPEED : MOVE_SPEED;

    const move = new THREE.Vector3();
    if (keys.current.KeyW) move.add(forward.current);
    if (keys.current.KeyS) move.sub(forward.current);
    if (keys.current.KeyD) move.add(right.current);
    if (keys.current.KeyA) move.sub(right.current);

    const moving = move.lengthSq() > 0;
    if (moving) {
      move.normalize().multiplyScalar(speed);
    }

    const currentVel = body.linvel();
    const damp = 1 - Math.exp(-ACCEL * delta);
    const nextX = THREE.MathUtils.lerp(currentVel.x, move.x, damp);
    const nextZ = THREE.MathUtils.lerp(currentVel.z, move.z, damp);
    body.setLinvel({ x: nextX, y: currentVel.y, z: nextZ }, true);

    const planarSpeed = Math.hypot(nextX, nextZ);
    if (moving && planarSpeed > 0.1) {
      bobTime.current += delta * BOB_FREQ * (sprinting ? 1.4 : 1);
    }
    const bob = moving ? Math.sin(bobTime.current) * BOB_AMOUNT * Math.min(planarSpeed / speed, 1) : 0;
    camera.position.set(t.x, t.y + EYE_HEIGHT + bob, t.z);

    const targetFov = sprinting && moving ? SPRINT_FOV : BASE_FOV;
    currentFov.current = THREE.MathUtils.lerp(currentFov.current, targetFov, 1 - Math.exp(-8 * delta));
    if (camera instanceof THREE.PerspectiveCamera && Math.abs(camera.fov - currentFov.current) > 0.01) {
      camera.fov = currentFov.current;
      camera.updateProjectionMatrix();
    }

    let nearest: { id: string; dist: number } | null = null;
    for (const project of projects) {
      const dx = project.position[0] - t.x;
      const dz = project.position[2] - t.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < PROXIMITY_RADIUS && (!nearest || dist < nearest.dist)) {
        nearest = { id: project.id, dist };
      }
    }
    setNearbyProjectId(nearest?.id ?? null);

    if (keys.current.KeyE && !wasPressingE.current && nearest) {
      openProject(nearest.id);
    }
    wasPressingE.current = keys.current.KeyE;
  });

  return (
    <>
      <PointerLockControls
        onLock={() => setLocked(true)}
        onUnlock={() => setLocked(false)}
      />
      <RigidBody
        ref={bodyRef}
        colliders={false}
        mass={1}
        lockRotations
        position={[0, 1, 6]}
        friction={0}
        linearDamping={4}
      >
        <CapsuleCollider args={[0.5, 0.4]} />
      </RigidBody>
    </>
  );
}
