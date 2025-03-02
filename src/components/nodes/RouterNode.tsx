import { BaseNode, BaseNodeProps } from './BaseNode';
import { RouterNode } from '../../types/index';
import { useDispatch } from 'react-redux';
import { updateNodeContent } from '../../store';
import { NodePorts } from './NodePort';

interface RouterNodeProps extends Omit<BaseNodeProps, 'node'> {
    node: RouterNode;
    onConnectionStart?: (nodeId: string, portId: string, startPos: { x: number; y: number }) => void;
    onConnectionEnd?: (nodeId: string, portId: string) => void;
}

export function RouterNodeComponent({ node, onConnectionStart, onConnectionEnd, ...props }: RouterNodeProps) {
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
            <div className='w-full h-full p-4 flex flex-col gap-2'>
                <label htmlFor="path" className='text-sm font-medium text-base-content/70'>Path</label>
                <input
                    id="path"
                    className="w-full px-3 py-2 text-sm bg-base-200 rounded-lg border border-base-300 
                             focus:outline-none focus:border-primary transition-colors
                             placeholder:text-base-content/50"
                    value={node.content}
                    placeholder="输入路径..."
                    onChange={e => dispatch(updateNodeContent({
                        id: node.id,
                        content: e.target.value
                    }))}
                />
            </div>
            <div className="relative z-10">
                <NodePorts
                    type='input'
                    ports={node.inputs}
                    nodeId={node.id}
                    onConnectionStart={onConnectionStart}
                    onConnectionEnd={onConnectionEnd}
                />
            </div>
        </BaseNode>
    );
}