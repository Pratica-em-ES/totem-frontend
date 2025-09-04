"use client";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import MapScene from "./Mapscene";
import { MapContainer } from "./Map.style";
import * as THREE from "three";
import { BACKGROUND_COLOR } from "../../constants/mapconstants";

export default function MapComponent() {
  const [showInitialMap] = React.useState(true);

  return (
    <MapContainer onContextMenu={(e) => e.preventDefault()}>
      <Canvas
        shadows
        camera={{ fov: 45, position: [-17.0, 50, 80.71] }}
        style={{ background: BACKGROUND_COLOR }}
        gl={{ toneMapping: THREE.ACESFilmicToneMapping }}
        onCreated={({ gl }) => (gl.outputColorSpace = THREE.SRGBColorSpace)}
      >

        <ambientLight intensity={1} />
        <directionalLight position={[0, 0, 0]} intensity={2} castShadow />

        <Environment preset="city" background={false} />

        <OrbitControls
          makeDefault
          minDistance={30}
          maxDistance={90}
          minPolarAngle={0.3}
          maxPolarAngle={Math.PI / 2 - 0.1}
          setPolarAngle={Math.PI / 2 - 0.1}

          enablePan={false}
        />

        <group name="exportGroup" rotation={[0, Math.PI, 0]}>
          {showInitialMap && <MapScene />}
        </group>
      </Canvas>
    </MapContainer>
  );
}
