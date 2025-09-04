'use client';
import React, { useMemo } from 'react';
import { useThree, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

export type Road = {
  points: [number, number][];
  width: number;
};

type Props = {
  roads: Road[];
  worldSize: number;
  textureSrc?: string;
};

const RoadOverlay: React.FC<Props> = ({
  roads,
  worldSize,
  textureSrc = '/textures/cobblestone.jpg',
}) => {
  const { gl } = useThree();

  const roadTex = useLoader(THREE.TextureLoader, textureSrc);
  useMemo(() => {
    roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping;
    roadTex.repeat.set(worldSize / 4, worldSize / 4);
    roadTex.anisotropy = gl.capabilities.getMaxAnisotropy?.() ?? 4;
  }, [roadTex, worldSize, gl]);

  const alphaMap = useMemo(() => {
    const sizePx = 2048;
    const cvs = document.createElement('canvas');
    cvs.width = cvs.height = sizePx;
    const ctx = cvs.getContext('2d')!;

    ctx.clearRect(0, 0, sizePx, sizePx);

    const scale = sizePx / worldSize;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,1)';

    roads.forEach(({ points, width }) => {
      ctx.lineWidth = width * scale;
      ctx.beginPath();
      points.forEach(([x, z], i) => {
        const px = (x + worldSize / 2) * scale;
        const pz = (z + worldSize / 2) * scale; 
        if (i === 0) {
          ctx.moveTo(px, pz);
        } else {
          ctx.lineTo(px, pz);
        }
      });
      ctx.stroke();
    });

    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
  }, [roads, worldSize]);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.01, 0]}     /* 1 cm acima para evitar z-fighting */
      renderOrder={1}
    >
      <planeGeometry args={[worldSize, worldSize]} />
      <meshStandardMaterial
        map={roadTex}
        alphaMap={alphaMap}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
};

export default RoadOverlay;
