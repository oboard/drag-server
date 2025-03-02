import { BaseNode, BaseNodeProps } from './BaseNode';
import { TextNode } from '../../types/index';
import { useDispatch } from 'react-redux';
import { updateNodeContent } from '../../store';
import { NodePorts } from './NodePort';

interface TextNodeProps extends Omit<BaseNodeProps, 'node'> {
    node: TextNode;
    onConnectionStart?: (nodeId: string, portId: string, startPos: { x: number; y: number }) => void;
    onConnectionEnd?: (nodeId: string, portId: string) => void;
}

export function TextNodeComponent({ node, onConnectionStart, onConnectionEnd, ...props }: TextNodeProps) {
    const dispatch = useDispatch();

    return (
        <BaseNode resizable={true} node={node} {...props}>
            <div className="relative z-10">
                <NodePorts
                    type='output'
                    ports={node.outputs}
                    nodeId={node.id}
                    onConnectionStart={onConnectionStart}
                    onConnectionEnd={onConnectionEnd}
                />
            </div>
            <div className='w-full h-full p-2'>
                <textarea
                    className="w-full h-full resize-none border-none focus:outline-none bg-base-200 rounded-lg p-2"
                    value={node.content}
                    onChange={e => dispatch(updateNodeContent({
                        id: node.id,
                        content: e.target.value
                    }))}
                />
            </div>
        </BaseNode>
    );
}