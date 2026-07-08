"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import {
  RigidBody,
  CapsuleCollider,
  useRapier,
  type RapierRigidBody,
} from "@react-three/rapier";
import * as THREE from "three";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useIsTouch } from "@/hooks/useIsTouch";
import { useExperienceStore } from "@/store/useExperienceStore";
import { projects } from "@/lib/projects";
import { touchInput } from "@/lib/touchInput";

const LOOK_SENSITIVITY = 0.0028;
const MAX_PITCH = Math.PI / 2 - 0.05;

const MOVE_SPEED = 5;
const SPRINT_SPEED = 8;
const ACCEL = 14;
const AIR_ACCEL = 3;
const EYE_HEIGHT = 1.6;
const PROXIMITY_RADIUS = 3.5;
const BASE_FOV = 75;
const SPRINT_FOV = 82;
const BOB_FREQ = 9;
const BOB_AMOUNT = 0.045;
const CAPSULE_HALF_HEIGHT = 0.5;
const CAPSULE_RADIUS = 0.4;
const CAPSULE_BOTTOM = CAPSULE_HALF_HEIGHT + CAPSULE_RADIUS;
const GROUND_MARGIN = 0.15;
const JUMP_SPEED = 7.5;

export function Player() {
  const bodyRef = useRef<RapierRigidBody>(null);
  const { camera } = useThree();
  const { world, rapier } = useRapier();
  const keys = useKeyboard();
  const isTouch = useIsTouch();
  const setLocked = useExperienceStore((s) => s.setLocked);
  const setNearbyProjectId = useExperienceStore((s) => s.setNearbyProjectId);
  const activeProjectId = useExperienceStore((s) => s.activeProjectId);
  const openProject = useExperienceStore((s) => s.openProject);

  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const wasPressingE = useRef(false);
  const bobTime = useRef(0);
  const currentFov = useRef(BASE_FOV);
  const yaw = useRef(0);
  const pitch = useRef(0);

  useFrame((_, delta) => {
    const body = bodyRef.current;
    if (!body) return;

    const t = body.translation();

    if (activeProjectId) {
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      camera.position.set(t.x, t.y + EYE_HEIGHT, t.z);
      return;
    }

    if (isTouch) {
      yaw.current -= touchInput.look.x * LOOK_SENSITIVITY;
      pitch.current = THREE.MathUtils.clamp(
        pitch.current - touchInput.look.y * LOOK_SENSITIVITY,
        -MAX_PITCH,
        MAX_PITCH
      );
      touchInput.look.x = 0;
      touchInput.look.y = 0;
      camera.rotation.order = "YXZ";
      camera.rotation.set(pitch.current, yaw.current, 0);
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
    if (isTouch) {
      move.addScaledVector(forward.current, -touchInput.move.y);
      move.addScaledVector(right.current, touchInput.move.x);
    }

    const moving = move.lengthSq() > 0.0001;
    if (moving) {
      const magnitude = Math.min(move.length(), 1);
      move.normalize().multiplyScalar(speed * magnitude);
    }

    const groundHit = world.castRay(
      new rapier.Ray(t, { x: 0, y: -1, z: 0 }),
      CAPSULE_BOTTOM + GROUND_MARGIN,
      true,
      undefined,
      undefined,
      undefined,
      body
    );
    const grounded = groundHit !== null && groundHit.timeOfImpact <= CAPSULE_BOTTOM + GROUND_MARGIN;

    const currentVel = body.linvel();
    const damp = 1 - Math.exp(-(grounded ? ACCEL : AIR_ACCEL) * delta);
    const nextX = THREE.MathUtils.lerp(currentVel.x, move.x, damp);
    const nextZ = THREE.MathUtils.lerp(currentVel.z, move.z, damp);
    const jumpPressed = keys.current.Space || (isTouch && touchInput.jump);
    const nextY = grounded && jumpPressed ? JUMP_SPEED : currentVel.y;
    body.setLinvel({ x: nextX, y: nextY, z: nextZ }, true);

    const planarSpeed = Math.hypot(nextX, nextZ);
    if (moving && grounded && planarSpeed > 0.1) {
      bobTime.current += delta * BOB_FREQ * (sprinting ? 1.4 : 1);
    }
    const bob = moving && grounded ? Math.sin(bobTime.current) * BOB_AMOUNT * Math.min(planarSpeed / speed, 1) : 0;
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
      {!isTouch && (
        <PointerLockControls
          onLock={() => setLocked(true)}
          onUnlock={() => setLocked(false)}
        />
      )}
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
