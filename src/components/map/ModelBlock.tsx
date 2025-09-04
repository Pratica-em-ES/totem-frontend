import React, { useEffect, useRef, useState } from "react";
import { GLTFLoader } from "three-stdlib";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { BLOCK_TOGGLE_COLOR, TEXT_COLOR } from "../../constants/mapconstants";
import { useHighlight } from "@/app/contexts/MapHighlightContext";

export interface ModelBlockProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  label?: string;
  modelPath: string;
}

const ModelBlock: React.FC<ModelBlockProps> = ({
  position,
  rotation,
  label,
  modelPath,
}) => {
  const gltf  = useLoader(GLTFLoader, modelPath);
  const group = useRef<THREE.Group>(null);

  const { labels } = useHighlight();

  const isHighlighted = label ? labels.has(label.toUpperCase()) : false;


  const [labelPos, setLabelPos] =
    useState<[number, number, number]>([0, 0, 0]);

  useEffect(() => {
    if (!gltf?.scene) return;


    const box    = new THREE.Box3().setFromObject(gltf.scene);
    const size   = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    setLabelPos([center.x, center.y + size.y / 2 + 0.2, center.z]);

    gltf.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        const mats: THREE.Material[] = Array.isArray(obj.material)
          ? obj.material
          : [obj.material];

        mats.forEach((m) => {
          if (m instanceof THREE.MeshStandardMaterial && m.color && !m.userData.originalColor) {
            m.userData.originalColor = m.color.clone();
          }
        });
      }
    });
  }, [gltf]);

  useEffect(() => {
    const root = group.current;
    if (!root) return;

    root.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;

      const mats: THREE.Material[] = Array.isArray(obj.material)
        ? obj.material
        : [obj.material];

      mats.forEach((m) => {
        if (!(m instanceof THREE.MeshStandardMaterial) || !m.color || !m.userData.originalColor) return;

        const mat = m as THREE.MeshStandardMaterial;
        if (isHighlighted) {
          mat.color.set(BLOCK_TOGGLE_COLOR);
        } else {
          mat.color.copy(m.userData.originalColor);
        }
      });
    });

    
  }, [isHighlighted]);

  return (
    <group ref={group} position={position} rotation={rotation}>
      <primitive object={gltf.scene.clone()} />

      {label && (
        <Text
          position={labelPos}
          rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
          fontSize={0.5}
          color={TEXT_COLOR}
          anchorX="center"
          anchorY="middle"
          outlineColor="black"
          outlineWidth={0.05}
          scale={[3.5, 3.5, 3.5]}
        >
          {label}
        </Text>
      )}
    </group>
  );
};

export default ModelBlock;
