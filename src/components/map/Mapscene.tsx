"use client";
import { useEffect, useState } from "react";  // Importando hooks do React, hooks são funções que 
import Block, { ModelBlockProps } from "./ModelBlock";  // Importa o componente Block e a tipagem ModelBlockProps. Devem ser iguais as que serão retornadas pela API
import RoadOverlay from "./roadOverlay";
import Floor from "./Floor";

interface Road {
  width: number;
  points: [number, number][];
}

const MapScene: React.FC = () => {
    // stands é a variavel, setStands é a função que atualiza o estado, o estado inicial é um array vazio
    const [stands, setStands] = useState<ModelBlockProps[]>([]);
    const [roads, setRoads] = useState<Road[]>([]);

    useEffect(() => {  // Um useEffect executa "efeitos coleterais", nesse caso, buscar dados de uma API
        const fetchScene = async () => {
        try {
            const res = await fetch("http://localhost:5000/scene-config");  // TODO: Mudar o endpoint para o correto
            const data = await res.json(); // Pega o corpo da resposta e transforma em JSON
            console.log("Dados do endpoint:", data);
            setStands(data.stands);  // Atualiza o estado com os dados recebidos da API
            setRoads(data.roads);  // Atualiza o estado com os dados recebidos da API
        } catch (err) {
            console.error("Erro ao buscar configuração do Mapscene:", err);
        }
        };
        fetchScene();  // Chama a função para buscar os dados quando o componente é montado
    }, []);

    // Tudo que você colocar dentro do return será transformado em HTML/DOM ou, no caso do react-three-fiber, em objetos 3D da cena.
    return ( // Tudo dentro do return é JSX, a sintaxe do React para descrever a interface (o que vai aparecer na tela)
        <>
        <ambientLight intensity={3} />  // Isso é uma luz da cena 3D
        <Floor /> // Componenete que desenha o chão
        <RoadOverlay worldSize={90} roads={roads} />  // Componente que desenha estradas ou caminhos
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
