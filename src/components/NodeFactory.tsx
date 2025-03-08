import { NodeTypeEnum, NodeTypes } from '../types/index';
import { BaseNodeComponent } from './nodes/BaseNode';
import { JsonNodeComponent } from './nodes/JsonNode';
import { LogNodeComponent } from './nodes/LogNode';
import { TextNodeComponent } from './nodes/TextNode';

export interface NodeFactoryProps {
    node: NodeTypes;
    selected: boolean;
    onSelect: (nodeId: string, multiSelect: boolean) => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    onConnectionStart?: (nodeId: string, portId: string, startPos: { x: number; y: number }) => void;
    onConnectionEnd?: (nodeId: string, portId: string) => void;
    onPositionChange?: (nodeId: string) => void;
}

export function NodeFactory(props: NodeFactoryProps) {
    const { node } = props;

    switch (node.type) {
        case NodeTypeEnum.TEXT:
            return <TextNodeComponent {...props} node={node} />;
        case NodeTypeEnum.LOG:
            return <LogNodeComponent {...props} node={node} />;
        case NodeTypeEnum.JSON:
            return <JsonNodeComponent {...props} node={node} />;
        default:
            return <BaseNodeComponent {...props} node={node} />;
    }
} 