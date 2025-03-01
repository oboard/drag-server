import { BaseNode, BaseNodeProps } from './BaseNode';
import { LogNode } from 'types/index';

interface LogNodeProps extends Omit<BaseNodeProps, 'node' | 'resizable'> {
    node: LogNode;
}

export function LogNodeComponent(props: LogNodeProps) {
    return (
        <BaseNode {...props} resizable={true}>
            <textarea
                className="w-full h-full resize-none border-none focus:outline-none bg-transparent p-2"
                value={props.node.content}
                readOnly
            />
        </BaseNode>
    );
}