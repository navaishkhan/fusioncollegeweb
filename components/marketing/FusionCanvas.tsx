'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

function FusionLogo3D() {
  const logoGroup = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);
  const smooth = useRef({ x: 0, y: 0, scale: 1 });
  const pulse = useRef(0);
  const hovered = useRef(false);
  const logoTexture = useTexture('/logo.png');

  logoTexture.colorSpace = THREE.SRGBColorSpace;
  logoTexture.anisotropy = 16;

  useFrame(({ clock, pointer }, delta) => {
    const t = clock.elapsedTime;
    const targetX = pointer.x * (hovered.current ? 1.15 : 0.75);
    const targetY = pointer.y * (hovered.current ? 1.15 : 0.75);
    smooth.current.x += (targetX - smooth.current.x) * (hovered.current ? 0.07 : 0.045);
    smooth.current.y += (targetY - smooth.current.y) * (hovered.current ? 0.07 : 0.045);
    const hoverScale = hovered.current ? 1.045 : 1;
    const idleScale = 1 + Math.sin(t * 0.7) * 0.012;
    let clickScale = 1;
    if (pulse.current > 0) {
      pulse.current = Math.max(0, pulse.current - delta * 2.8);
      clickScale = 1 + Math.sin(pulse.current * Math.PI) * 0.05;
    }
    smooth.current.scale += (hoverScale * idleScale * clickScale - smooth.current.scale) * 0.1;
    if (logoGroup.current) {
      logoGroup.current.rotation.y = smooth.current.x * (hovered.current ? 0.14 : 0.09);
      logoGroup.current.rotation.x = -smooth.current.y * (hovered.current ? 0.08 : 0.05);
      logoGroup.current.rotation.z = Math.sin(t * 0.35) * 0.018;
      logoGroup.current.position.y = Math.sin(t * 0.55) * 0.055;
      logoGroup.current.position.x = smooth.current.x * 0.06;
      logoGroup.current.scale.setScalar(smooth.current.scale);
    }
    if (haloRef.current?.material && 'opacity' in haloRef.current.material) {
      haloRef.current.rotation.z = t * (hovered.current ? 0.09 : 0.05);
      (haloRef.current.material as THREE.MeshStandardMaterial).opacity = hovered.current ? 0.55 : 0.35;
    }
    if (rimLightRef.current) {
      rimLightRef.current.position.x = smooth.current.x * 1.8;
      rimLightRef.current.position.y = smooth.current.y * 1.2 + 0.4;
      rimLightRef.current.intensity = hovered.current ? 1.1 : 0.65;
    }
  });

  return (
    <group>
      <pointLight ref={rimLightRef} color="#00B4D8" intensity={0.65} distance={8} position={[0, 0.4, 2]} />
      <group ref={logoGroup}>
        <mesh position={[0.04, -0.06, -0.22]}>
          <circleGeometry args={[1.72, 64]} />
          <meshStandardMaterial color="#1A1C4E" transparent opacity={0.14} roughness={1} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0, -0.14]}>
          <circleGeometry args={[1.76, 64]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#3D4193" emissiveIntensity={0.08} metalness={0.15} roughness={0.55} />
        </mesh>
        <mesh ref={haloRef} position={[0, 0, -0.08]}>
          <torusGeometry args={[1.68, 0.014, 16, 100]} />
          <meshStandardMaterial color="#3D4193" transparent opacity={0.35} metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh
          onPointerOver={() => { hovered.current = true; }}
          onPointerOut={() => { hovered.current = false; }}
          onClick={() => { pulse.current = 1; }}
        >
          <circleGeometry args={[1.65, 64]} />
          <meshStandardMaterial map={logoTexture} transparent alphaTest={0.04} metalness={0.18} roughness={0.38} emissive="#3D4193" emissiveIntensity={0.04} />
        </mesh>
      </group>
    </group>
  );
}

export default function FusionCanvas() {
  return (
    <Canvas camera={{ position: [0, 0, 5.2], fov: 48 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 5, 6]} intensity={1.1} />
      <pointLight position={[4, 3, 4]} intensity={1.4} />
      <pointLight position={[-3, -2, 3]} color="#ECEEFF" intensity={0.5} />
      <Suspense fallback={null}>
        <FusionLogo3D />
      </Suspense>
    </Canvas>
  );
}
