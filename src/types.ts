export interface NodeType {
  id: string;
  type: string;
  name: string;
  icon: string;
  description: string;
}

export interface Node {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  inputs: { id: string; name: string }[];
  outputs: { id: string; name: string }[];
}

export interface Connection {
  id: string;
  sourceNodeId: string;
  sourceOutputId: string;
  targetNodeId: string;
  targetInputId: string;
  path: string;
} 