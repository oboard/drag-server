import { BaseNode, BaseNodeProps } from './BaseNode';
import { LogNode } from 'types/index';

interface LogNodeProps extends Omit<BaseNodeProps, 'node' | 'resizable'> {
    node: LogNode;
    onConnectionStart?: (nodeId: string, outputId: string, startPos: { x: number; y: number }) => void;
    onConnectionEnd?: (targetNodeId: string, targetInputId: string) => void;
}

export function LogNodeComponent(props: LogNodeProps) {
    const handleConnectionEnd = (_e: React.PointerEvent<HTMLButtonElement>) => {
        props.onConnectionEnd?.(props.node.id, 'input');
    };

    return (
        <BaseNode {...props} resizable={true}>
            <div className="w-full flex-1 p-2 bg-base-200 rounded-lg">
                <p className='text-sm'>
                    {props.node.content}
                </p>
            </div>
            <div className="flex flex-col gap-2 p-2 translate-x-[-16px]">
                {/* input area */}
                <div className='flex items-center gap-2'>
                    <button
                        type='button'
                        className='bg-primary rounded-full w-4 h-4 hover:bg-primary/80 transition-colors'
                        onPointerUp={handleConnectionEnd}
                        aria-label="Connect input"
                        data-port="input"
                    />
                    <span>Value</span>
                </div>
            </div>
        </BaseNode>
    );
}