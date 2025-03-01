// 基础节点信息
export interface BaseNode {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
}

// 节点描述信息
export interface NodeInfo extends BaseNode {
  icon: string;
  description: string;
}

// 节点端口类型
export interface Port {
  id: string;
  name: string;
}

// 节点大小
export interface NodeSize {
  width: number;
  height: number;
}

// 节点对象
export interface NodeObject extends BaseNode {
  inputs: Port[];
  outputs: Port[];
}

// 内容节点
export interface ContentNode extends NodeObject {
  content: string;
}

// 连接
export interface Connection {
  id: string;
  sourceNodeId: string;
  sourceOutputId: string;
  targetNodeId: string;
  targetInputId: string;
  path: string;
} 