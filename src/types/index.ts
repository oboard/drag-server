// 节点类型枚举
export enum NodeTypeEnum {
    TEXT = 'TEXT',
    JSON = 'JSON',
    LOG = 'LOG',
    ROUTER = 'ROUTER',
    PORT = 'PORT'
}

// 节点端口类型
export interface PropertyInfo {
    id: string;
    name: string;
    type: 'string' | 'response' | 'number' | 'any' | 'json';
}

// 节点配置
export interface NodeConfig {
    inputs: PropertyInfo[];
    outputs: PropertyInfo[];
    icon: string;
    description: string;
}

// 节点配置映射
export type NodeConfigMap = {
    [key in NodeTypeEnum]: NodeConfig;
}

export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

// 基础节点信息
export interface BaseNode {
    id: string;
    type: NodeTypeEnum;
    name: string;
    position: Position;
    size: Size;
    content: string;
    inputs: PropertyInfo[];
    outputs: PropertyInfo[];
}

// 节点描述信息
export interface NodeInfo extends Omit<BaseNode, 'inputs' | 'outputs' | 'content' | 'size'> {
    icon: string;
    description: string;
}

export type PropertyType = 'string' | 'response' | 'number' | 'any' | 'json';

// 连接
export interface Connection {
    id: string;
    sourceNodeId: string;
    sourceOutputId: string;
    targetNodeId: string;
    targetInputId: string;
    path: string;
    type: PropertyType;
}

export type NodeTypes = BaseNode;

