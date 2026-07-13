"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";

/**
 * Optional, content-supporting spatial signal map for SIGNAL//OS Immersive
 * mode. Dynamically imported (see signal-os-template.tsx) and only mounted
 * when WebGL is available and reduced-motion is not requested — Recruiter
 * mode and the static fallback never depend on this module.
 */
function SignalNodes() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }) => {
    if (!group.current) {
      return;
    }
    group.current.rotation.y = clock.elapsedTime * 0.12 + pointer.x * 0.1;
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.2) * 0.08 + pointer.y * 0.06;
  });

  const nodes: Array<[number, number, number, string]> = [
    [0.9, 0.5, 0.2, "#22d3ee"],
    [-0.8, 0.3, -0.3, "#7757ff"],
    [0.2, -0.7, 0.4, "#22d3ee"],
    [-0.4, -0.4, -0.5, "#f59e0b"],
    [0.6, 0.1, -0.6, "#2dd4bf"],
  ];

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshStandardMaterial color="#22d3ee" wireframe transparent opacity={0.3} />
      </mesh>
      {nodes.map(([x, y, z, color], index) => (
        <mesh key={index} position={[x, y, z]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}

export function isImmersiveSceneSupported() {
  if (typeof window === "undefined") {
    return false;
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return !reduced && !coarse && hasWebGL();
}

export default function SignalOsScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.6], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="absolute inset-0"
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 3, 4]} intensity={1.4} />
      <SignalNodes />
    </Canvas>
  );
}
