"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}

function DataCore() {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }) => {
    if (!group.current) {
      return;
    }

    group.current.rotation.y = clock.elapsedTime * 0.18 + pointer.x * 0.12;
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.24) * 0.1 + pointer.y * 0.08;
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1.08, 36, 18]} />
        <meshStandardMaterial color="#4da3ff" wireframe transparent opacity={0.38} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.35, 0.01, 10, 96]} />
        <meshBasicMaterial color="#39e6dc" transparent opacity={0.72} />
      </mesh>
      <mesh rotation={[0.9, 0.25, 0.4]}>
        <torusGeometry args={[1.62, 0.008, 10, 96]} />
        <meshBasicMaterial color="#67e8a5" transparent opacity={0.52} />
      </mesh>
      <mesh position={[0.88, 0.74, 0.42]}>
        <boxGeometry args={[0.12, 0.12, 0.12]} />
        <meshStandardMaterial color="#f7fbff" emissive="#4da3ff" emissiveIntensity={0.32} />
      </mesh>
      <mesh position={[-0.78, -0.56, 0.5]}>
        <boxGeometry args={[0.16, 0.08, 0.16]} />
        <meshStandardMaterial color="#ff7a66" emissive="#ff7a66" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0.18, -1.02, -0.62]}>
        <octahedronGeometry args={[0.12]} />
        <meshStandardMaterial color="#39e6dc" emissive="#39e6dc" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

function StaticHeroCore() {
  return (
    <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
      <div className="relative h-56 w-56 sm:h-72 sm:w-72">
        <div className="absolute inset-8 border border-[#4da3ff]/45" />
        <div className="absolute inset-2 rotate-12 border border-[#39e6dc]/35" />
        <div className="absolute inset-16 grid place-items-center border border-[#67e8a5]/45 bg-[#071225]/70">
          <span className="text-xs font-black uppercase tracking-[0.35em] text-[#9ed0ff]">AI</span>
        </div>
        <span className="absolute left-5 top-10 h-3 w-3 bg-[#39e6dc]" />
        <span className="absolute bottom-8 right-9 h-3 w-7 bg-[#ff7a66]" />
        <span className="absolute right-4 top-24 h-4 w-4 border border-white/60" />
      </div>
    </div>
  );
}

export function HeroScene() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      setEnabled(!reduced && !coarse && hasWebGL());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="absolute inset-0 hidden overflow-hidden lg:block" data-testid="hero-scene">
      <StaticHeroCore />
      {enabled ? (
        <Canvas
          camera={{ position: [0, 0, 4.2], fov: 42 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          className="absolute inset-0"
        >
          <ambientLight intensity={0.9} />
          <directionalLight position={[2, 3, 4]} intensity={1.6} />
          <DataCore />
        </Canvas>
      ) : null}
    </div>
  );
}
