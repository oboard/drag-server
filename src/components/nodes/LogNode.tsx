import { BaseNode, BaseNodeProps } from './BaseNode';
import { LogNode } from 'types/index';

interface LogNodeProps extends Omit<BaseNodeProps, 'node' | 'resizable'> {
    node: LogNode;
    onConnectionStart?: (nodeId: string, outputId: string, startPos: { x: number; y: number }) => void;
    onConnectionEnd?: (targetNodeId: string, targetInputId: string) => void;
}

export function LogNodeComponent(props: LogNodeProps) {
    const handleConnectionEnd = (e: React.PointerEvent<HTMLButtonElement>) => {
        console.log('LogNode - handleConnectionEnd', {
            nodeId: props.node.id,
            inputId: 'input'
        });
        props.onConnectionEnd?.(props.node.id, 'input');
    };

    return (
        <BaseNode {...props} resizable={true}>
            <div className="w-full flex-1 p-2 bg-base-200 rounded-lg">
                <p className='text-sm'>
                    {props.node.content}
                </p>
            </div>
            <div className="flex flex-col gap-2 p-2">
                {/* input area */}
                <div className='flex items-center gap-2'>
                    <button
                        type='button'
                        className='bg-base-200 rounded-full p-2 hover:bg-base-300 transition-colors'
                        onPointerUp={handleConnectionEnd}
                        aria-label="Connect input"
                        data-port="input"
                    >
                        <div className="w-2 h-2 rounded-full bg-primary" />
                    </button>
                    <span>Value</span>
                </div>
            </div>
        </BaseNode>
    );
}