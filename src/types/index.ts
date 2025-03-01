export const NodeType = {
    TEXT: 'text',
    LOG: 'log',
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
}

export interface TextNode extends BaseNode {
    type: typeof NodeType.TEXT;
}

export interface LogNode extends BaseNode {
    type: typeof NodeType.LOG;
}

export type NodeTypes = TextNode | LogNode;

// 类型守卫函数
export const isTextNode = (node: NodeTypes | undefined): node is TextNode => {
    return node?.type === NodeType.TEXT;
};

export const isLogNode = (node: NodeTypes | undefined): node is LogNode => {
    return node?.type === NodeType.LOG;
}; 