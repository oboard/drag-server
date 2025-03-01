import { BaseNode, BaseNodeProps } from './BaseNode';
import { LogNode } from 'types/index';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface LogNodeProps extends Omit<BaseNodeProps, 'node' | 'resizable'> {
    node: LogNode;
    onConnectionStart?: (nodeId: string, outputId: string, startPos: { x: number; y: number }) => void;
    onConnectionEnd?: (targetNodeId: string, targetInputId: string) => void;
}

export function LogNodeComponent(props: LogNodeProps) {
    const connections = useSelector((state: RootState) => state.flow.present.connections);

    const handleConnectionEnd = (_e: React.PointerEvent<HTMLButtonElement>) => {
        props.onConnectionEnd?.(props.node.id, 'input');
    };

    const handleConnectionStart = (e: React.PointerEvent<HTMLButtonElement>) => {
        const canvas = document.querySelector('.editor-background')?.parentElement;
        if (!canvas) return;

        const canvasRect = canvas.getBoundingClientRect();
        const scrollLeft = canvas.scrollLeft;
        const scrollTop = canvas.scrollTop;

        // 获取当前鼠标位置
        const currentPos = {
            x: e.clientX - canvasRect.left + scrollLeft,
            y: e.clientY - canvasRect.top + scrollTop
        };

        // 查找连接到这个输入端口的现有连接
        const existingConnection = connections.find(conn =>
            conn.targetNodeId === props.node.id && conn.targetInputId === 'input'
        );
        if (!existingConnection) return;

        props.onConnectionStart?.(props.node.id, 'input', currentPos);
    };

    return (
        <BaseNode {...props} resizable={true}>
            <div className="w-full flex-1 p-2 bg-base-200 rounded-lg">
                <p className='text-sm'>
                    {props.node.content}
                </p>
            </div>
            <div className="flex flex-col gap-2 p-2 translate-x-[-16px] relative z-10">
                {/* input area */}
                <div className='flex items-center gap-2'>
                    <button
                        type='button'
                        className='bg-primary rounded-full w-4 h-4 hover:bg-secondary transition-colors'
                        onPointerUp={handleConnectionEnd}
                        onPointerDown={handleConnectionStart}
                        aria-label="Connect input"
                        data-port="input"
                    />
                    <span>Value</span>
                </div>
            </div>
        </BaseNode>
    );
}