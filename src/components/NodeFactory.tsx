import { NodeTypes, NodeType } from '../types/index';
import { LogNodeComponent } from './nodes/LogNode';
import { TextNodeComponent } from './nodes/TextNode';

export interface NodeFactoryProps {
    node: NodeTypes;
    selected: boolean;
    onSelect: (nodeId: string, multiSelect: boolean) => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    onConnectionStart?: (nodeId: string, outputId: string, startPos: { x: number; y: number }) => void;
    onConnectionEnd?: (targetNodeId: string, targetInputId: string) => void;
    onPositionChange?: (nodeId: string) => void;
}

export function NodeFactory(props: NodeFactoryProps) {
    const { node } = props;

    switch (node.type) {
        case NodeType.TEXT:
            return <TextNodeComponent {...props} node={node} />;
        case NodeType.LOG:
            return <LogNodeComponent {...props} node={node} />;
    }

    const unknownNode = node as { type: string };
    console.error('Unknown node type:', unknownNode.type);
    return null;
} 