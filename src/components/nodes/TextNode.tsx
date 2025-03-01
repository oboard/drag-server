import { BaseNode, BaseNodeProps } from './BaseNode';
import { TextNode } from 'types/index';
import { useDispatch } from 'react-redux';
import { updateNodeContent } from '../../store';

interface TextNodeProps extends Omit<BaseNodeProps, 'node'> {
    node: TextNode;
    onConnectionStart?: (nodeId: string, outputId: string, startPos: { x: number; y: number }) => void;
    onConnectionEnd?: (targetNodeId: string, targetInputId: string) => void;
}

export function TextNodeComponent({ node, onConnectionStart, ...props }: TextNodeProps) {
    const dispatch = useDispatch();

    const handleConnectionStart = (e: React.PointerEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const canvas = document.querySelector('.editor-background')?.parentElement;
        if (!canvas) return;

        const { left, top } = canvas.getBoundingClientRect();
        const startPos = {
            x: rect.left + rect.width / 2 - left + canvas.scrollLeft,
            y: rect.top + rect.height / 2 - top + canvas.scrollTop
        };

        onConnectionStart?.(node.id, 'output', startPos);
    };

    return (
        <BaseNode node={node} {...props}>
            <div className="flex flex-col gap-2 p-2">
                <div className='flex items-center gap-2 justify-end translate-x-[16px]'>
                    <span>Value</span>
                    <button
                        type='button'
                        className='bg-primary rounded-full w-4 h-4 hover:bg-primary/80 transition-colors'
                        onPointerDown={handleConnectionStart}
                        aria-label="Connect output"
                        data-port="output"
                    />
                </div>
            </div>
            <textarea
                className="w-full h-[calc(100%-4rem)] resize-none border-none focus:outline-none bg-transparent p-2"
                value={node.content}
                onChange={e => dispatch(updateNodeContent({
                    id: node.id,
                    content: e.target.value
                }))}
            />
        </BaseNode>
    );
}