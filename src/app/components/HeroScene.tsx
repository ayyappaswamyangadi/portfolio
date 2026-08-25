"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "next-themes";

// Ring/light/sparkle accents — theme-aware. The core shape/material below is
// intentionally the *same* geometry in both themes (per feedback: keep the
// light theme's shape, only change dark's colors/lighting), just tuned
// brighter and shinier for dark so it doesn't read as flat/faded.
const accents = {
  light: {
    ring1: "#B777FF",
    ring2: "#A86BEB",
    light1: "#B777FF",
    light2: "#A86BEB",
    sparkles: "#B777FF",
  },
  dark: {
    ring1: "#FFC25F", // gold
    ring2: "#6C93D9", // navy
    light1: "#FFC25F",
    light2: "#6C93D9",
    sparkles: "#FFD28A",
  },
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// Same icosahedron + MeshDistortMaterial "liquid core" in both themes — only
// the material's color/emissive differ. The previous dark pass pushed
// metalness up to 0.8 and added an <Environment> reflection map to justify
// it — but a highly metallic material's own color barely shows without a
// *strong, colorful* reflection source, and drei's Environment presets fetch
// an HDR from a CDN at runtime, so if that fetch is slow/blocked the
// material silently falls back to looking dark and flat. That's very likely
// why it still read as "faded" even after adding it. This drops back to
// metalness/roughness matching the light theme's already-proven values (the
// only things that actually determine how "faded vs. vivid" the material
// looks) and instead gets its extra dark-mode punch from a strong,
// self-illuminated emissive glow, which always renders regardless of any
// external asset or reflection.
function Core({ reduced, isDark }: { reduced: boolean; isDark: boolean }) {
  return (
    <Float
      speed={reduced ? 0 : 1.6}
      rotationIntensity={reduced ? 0 : 0.35}
      floatIntensity={reduced ? 0 : 0.7}
    >
      <mesh scale={1.6}>
        <icosahedronGeometry args={[1, 12]} />
        <MeshDistortMaterial
          color={isDark ? "#FFC145" : "#7800FF"}
          emissive={isDark ? "#FF9A1F" : "#2C1063"}
          emissiveIntensity={isDark ? 0.95 : 0.55}
          roughness={0.15}
          metalness={0.65}
          distort={reduced ? 0.12 : 0.34}
          speed={reduced ? 0 : 1.6}
        />
      </mesh>
    </Float>
  );
}

function CoreBlob({
  reduced,
  isDark,
  ring1,
  ring2,
}: {
  reduced: boolean;
  isDark: boolean;
  ring1: string;
  ring2: string;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    if (!reduced) g.rotation.y += delta * 0.16;
    // Subtle parallax toward the pointer — never fully tracks it.
    const targetX = state.pointer.y * 0.22;
    const targetZ = state.pointer.x * 0.18;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetX, 0.03);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, targetZ, 0.03);
  });

  return (
    <group ref={group}>
      <Core reduced={reduced} isDark={isDark} />

      {/* Orbiting wire rings — circuit / neural-net accent */}
      <mesh rotation={[0.6, 0.3, 0]} scale={2.55}>
        <torusGeometry args={[1, 0.012, 16, 128]} />
        <meshBasicMaterial
          color={ring1}
          transparent
          opacity={isDark ? 0.55 : 0.4}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation={[1.4, 0.9, 0.4]} scale={2.95}>
        <torusGeometry args={[1, 0.007, 16, 128]} />
        <meshBasicMaterial
          color={ring2}
          transparent
          opacity={isDark ? 0.45 : 0.3}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Full-bleed WebGL hero background — a themed "core" with drifting
 *  particles. Dynamically imported with ssr:false from Home.tsx since Canvas
 *  needs the browser's WebGL context. */
export default function HeroScene() {
  const reduced = useReducedMotion();
  // Falls back to the dark palette before mount — matches layout.tsx's
  // `defaultTheme="dark"`, and this component is already client-only
  // (dynamically imported with ssr:false from Home.tsx) so there's no
  // server-render to mismatch against.
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const palette = isDark ? accents.dark : accents.light;

  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: true,
      }}
      camera={{ position: [0, 0, 5.4], fov: 42 }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={isDark ? 0.5 : 0.7} />
      <pointLight position={[4, 3, 4]} intensity={isDark ? 55 : 35} color={palette.light1} />
      <pointLight position={[-4, -2, 3]} intensity={isDark ? 32 : 30} color={palette.light2} />
      {isDark && (
        <>
          {/* Catch light: a tight, bright point toward camera so the
              material gets one crisp, visible highlight instead of an even
              glow. */}
          <pointLight position={[1.4, 1.8, 4.5]} intensity={26} color="#FFF3D6" />
          {/* Rim light: placed behind the core (negative z) so its edge
              picks up a glowing gold outline against the navy backdrop —
              this is what actually reads as "attractive/glowing" rather
              than any material tweak, and unlike Environment it's a plain
              light with zero external dependency. */}
          <pointLight position={[-1, 0.5, -4]} intensity={38} color="#FFC25F" />
        </>
      )}
      <Suspense fallback={null}>
        <CoreBlob reduced={reduced} isDark={isDark} ring1={palette.ring1} ring2={palette.ring2} />
        {!reduced && (
          <Sparkles
            count={isDark ? 70 : 80}
            scale={7.5}
            size={2.2}
            speed={0.25}
            color={palette.sparkles}
            opacity={isDark ? 0.75 : 0.55}
          />
        )}
      </Suspense>
    </Canvas>
  );
}
