import React, { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

const Floor: React.FC = () => {
  const grassTexture = useLoader(THREE.TextureLoader, "/textures/grass.jpg");
  useMemo(() => {
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(30, 30);
    grassTexture.anisotropy = 8;
  }, [grassTexture]);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      name="FloorMesh"
      receiveShadow
    >
      <planeGeometry args={[90, 90]} />
      <meshStandardMaterial
        map={grassTexture}
        roughness={0.8}
        color="#4caf50"
      />
    </mesh>
  );
};

export default Floor;
