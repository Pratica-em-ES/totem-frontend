import type { EdgeDTO } from "./EdgeDTO";
import type { NodeDTO } from "./NodeDTO";

export interface MapBuildingDTO {
  id: number;
  name: string;
  modelPath: string;
  nodeId: number;
}

export interface MapDTO {
  nodes: NodeDTO[];
  edges: EdgeDTO[];
  buildings: MapBuildingDTO[];
}