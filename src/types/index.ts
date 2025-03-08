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

// 具体节点类型
export interface TextNode extends BaseNode {
    type: NodeTypeEnum.TEXT;
}

export interface LogNode extends BaseNode {
    type: NodeTypeEnum.LOG;
}

export interface RouterNode extends BaseNode {
    type: NodeTypeEnum.ROUTER;
}

export interface PortNode extends BaseNode {
    type: NodeTypeEnum.PORT;
}

export interface JsonNode extends BaseNode {
    type: NodeTypeEnum.JSON;
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

export type NodeTypes = TextNode | LogNode | RouterNode | PortNode | JsonNode;