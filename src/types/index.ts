import { PropertyInfo } from "types";

export const NodeType = {
    TEXT: 'text',
    LOG: 'log',
    ROUTER: 'router',
    PORT: 'port',
} as const;

export type NodeTypeEnum = typeof NodeType[keyof typeof NodeType];

export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

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

export interface TextNode extends BaseNode {
    type: typeof NodeType.TEXT;
}

export interface LogNode extends BaseNode {
    type: typeof NodeType.LOG;
}

export interface RouterNode extends BaseNode {
    type: typeof NodeType.ROUTER;
}

export interface PortNode extends BaseNode {
    type: typeof NodeType.PORT;
}

export interface Connection {
    id: string;
    sourceNodeId: string;
    sourceOutputId: string;
    targetNodeId: string;
    targetInputId: string;
    path: string;
}

export type NodeTypes = TextNode | LogNode | RouterNode | PortNode;

// 类型守卫函数
export const isTextNode = (node: NodeTypes | undefined): node is TextNode => {
    return node?.type === NodeType.TEXT;
};

export const isLogNode = (node: NodeTypes | undefined): node is LogNode => {
    return node?.type === NodeType.LOG;
};

export const isRouterNode = (node: NodeTypes | undefined): node is RouterNode => {
    return node?.type === NodeType.ROUTER;
};

export const isPortNode = (node: NodeTypes | undefined): node is PortNode => {
    return node?.type === NodeType.PORT;
}; 