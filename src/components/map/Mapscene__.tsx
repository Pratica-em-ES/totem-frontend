"use client";
import Block, { ModelBlockProps } from "./ModelBlock";
import Floor from "./Floor";
import RoadOverlay from "./roadOverlay";

const stands: ModelBlockProps[] = [
  {
    position: [0, 0, 15],
    rotation: [0, 0, 0],
    modelPath: "/models/tecnopuc.glb",
  },
  {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    label: "99 A",
    modelPath: "/models/99A.glb",
  },
  { position: [0, 0, 0], label: "95 A", modelPath: "/models/95A.glb" },
  {
    position: [0, 0, 0],
    label: "97",
    modelPath: "/models/97.glb",
  },
  { position: [0, 0, 0], label: "95 C", modelPath: "/models/95c.glb" },
  {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    label: "96 A",
    modelPath: "/models/96A.glb",
  },

  {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    label: "96 B/C/D/F",
    modelPath: "/models/96BCDF.glb",
  },

  {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    label: "96 J",
    modelPath: "/models/96j.glb",
  },
  {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    label: "96 E/H/I/G",
    modelPath: "/models/96.glb",
  },
  {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    label: "91 B",
    modelPath: "/models/91B.glb",
  },

  {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    label: "94",
    modelPath: "/models/94.glb",
  },
  {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    label: "93",
    modelPath: "/models/93.glb",
  },
  { position: [0, 0, 0], label: "92 A", modelPath: "/models/92A.glb" },
  { position: [0, 0, 0], label: "91 A", modelPath: "/models/91A.glb" },
];

const MapScene: React.FC = () => {
  return (
    <>
      <ambientLight intensity={3} />
      <Floor />

      <RoadOverlay
        worldSize={90}
        roads={[
          /* 1 ─ Norte-sul longo */
          {
            width: 3,
            points: [
              [-13, 28],
              [-13, -26],
            ],
          },

          /* 2 ─ Diagonal curta (próximo aos prédios verdes) */
          {
            width: 3,
            points: [
              [31.45, 8.56],
              [19, 18.29],
            ],
          },

          /* 3 ─ Diagonal longa no canto superior-dir. */
          {
            width: 3,
            points: [
              [30, 29],
              [13.5, 12.9],
            ],
          },

          /* 4 ─ Rua leste-oeste (altura z ≈ 13) */
          {
            width: 3,
            points: [
              [13, 13],
              [-13, 13],
            ],
          },

          /* 5 ─ Rua leste-oeste (altura z ≈ -22) */
          {
            width: 3,
            points: [
              [-13, -22],
              [17.73, -22],
            ],
          },

          /* 6 ─ Avenida norte-sul pelo x ≈ 13 */
          {
            width: 3,
            points: [
              [13, 36],
              [13, -20],
            ],
          },

          /* 7 ─ Rua leste-oeste (altura z ≈ -1.5) */
          {
            width: 3,
            points: [
              [-13, -1.5],
              [13, -1.5],
            ],
          },

          /* 8 ─ Rua leste-oeste (altura z ≈ 28) */
          {
            width: 3,
            points: [
              [-13, 28],
              [12, 28],
            ],
          },

          /* 9 ─ Via larga (12 u) descendo pelo x ≈ 15 */
          {
            width: 12,
            points: [
              [17, -21],
              [17, -29.5],
            ],
          },

          /* 10 ─ Extensão no extremo esquerdo */
          {
            width: 3,
            points: [
              [-14, 21],
              [-31, 21],
            ],
          },

          {
            width: 3,
            points: [
              [-31, 21],
              [-31, 30.08],
            ],
          },

          /*PORTAS */
          {
            width: 3,
            points: [
              [-18.66, 10.5],
              [-14.1, 10.5],
            ],
          },

          /* 11 ─ Extensão no extremo direito */
          {
            width: 3,
            points: [
              [3.2, 4.58],
              [3.2, -0.25],
            ],
          },

          /* 12 ─ Extensão no extremo direito */
          {
            width: 3,
            points: [
              [0.7, 14.14],
              [1.03, 17.37],
            ],
          },

          /* 13 ─ Extensão no extremo direito */
          {
            width: 3,
            points: [
              [3.1, 29.22],
              [3.1, 32.76],
            ],
          },

          {
            width: 3,
            points: [
              [-17.95, -11.01],
              [-13.71, -11.11],
            ],
          },

          /*caminho do predio vermelho*/
          {
            width: 3,
            points: [
              [12.77, -30.41],
              [11.31, -38.15],
            ],
          },

          {
            width: 3,
            points: [
              [11.07, -38.85],
              [6.99, -38.85],
            ],
          },

          {
            width: 3,
            points: [
              [3.16, -30.6],
              [6.51, -38.57],
            ],
          },

          {
            width: 3,
            points: [
              [4.76, -11],
              [11.8, -11],
            ],
          },
          /*CAMINHO ENTRADA PRINCIPAL*/
          {
            width: 4,
            points: [
              [26.9, -25.08],
              [34.52, -33.1],
              [35.59, -37.6],
              [44.66, -40.07],
            ],
          },
        ]}
      />

      {stands.map((stand, i) => (
        <Block key={i} {...stand} />
      ))}

      <mesh position={[18.56, 0.5, -16.42]}>
        <boxGeometry args={[1, 1, 0.5]} />
        <meshStandardMaterial color="#9b111e" metalness={0.1} roughness={0.6} />
      </mesh>
    </>
  );
};

export default MapScene;
