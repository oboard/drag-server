import { BaseNode, BaseNodeProps } from './BaseNode';
import { LogNode } from '../../types/index';
import { NodePorts } from './NodePort';

interface LogNodeProps extends Omit<BaseNodeProps, 'node' | 'resizable'> {
    node: LogNode;
    onConnectionStart?: (nodeId: string, portId: string, startPos: { x: number; y: number }) => void;
    onConnectionEnd?: (nodeId: string, portId: string) => void;
}

export function LogNodeComponent(props: LogNodeProps) {
    return (
        <BaseNode {...props} resizable={true}>
            <div className="w-full flex-1 p-2 bg-base-200 rounded-lg">
                <p className='text-sm'>
                    {props.node.content}
                </p>
            </div>
            <div className="relative z-10 my-2">
                <NodePorts
                    type='input'
                    ports={props.node.inputs}
                    nodeId={props.node.id}
                    onConnectionStart={props.onConnectionStart}
                    onConnectionEnd={props.onConnectionEnd}
                />
            </div>
        </BaseNode>
    );
}