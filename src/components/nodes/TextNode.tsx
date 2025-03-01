import { BaseNode, BaseNodeProps } from './BaseNode';
import { TextNode } from 'types/index';
import { useDispatch } from 'react-redux';
import { updateNodeContent } from '../../store';

interface TextNodeProps extends Omit<BaseNodeProps, 'node'> {
    node: TextNode;
    onConnectionStart?: (nodeId: string, outputId: string, startPos: { x: number; y: number }) => void;
    onConnectionEnd?: (targetNodeId: string, targetInputId: string) => void;
}

export function TextNodeComponent(props: TextNodeProps) {
    const dispatch = useDispatch();

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        dispatch(updateNodeContent({
            id: props.node.id,
            content: e.target.value
        }));
    };

    const handleConnectionStart = (e: React.PointerEvent<HTMLButtonElement>) => {
        console.log('TextNode - handleConnectionStart');
        const rect = e.currentTarget.getBoundingClientRect();
        const canvas = document.querySelector('.editor-background')?.parentElement;
        if (!canvas) {
            console.error('TextNode - Canvas not found');
            return;
        }

        const canvasRect = canvas.getBoundingClientRect();
        const scrollLeft = canvas.scrollLeft;
        const scrollTop = canvas.scrollTop;

        const startPos = {
            x: rect.left + rect.width / 2 - canvasRect.left + scrollLeft,
            y: rect.top + rect.height / 2 - canvasRect.top + scrollTop
        };
        console.log('TextNode - Connection start position:', startPos);

        props.onConnectionStart?.(props.node.id, 'output', startPos);
    };

    return (
        <BaseNode {...props}>
            <div className="flex flex-col gap-2 p-2">
                {/* output area */}
                <div className='flex items-center gap-2 justify-end'>
                    <span>Value</span>
                    <button
                        type='button'
                        className='bg-base-200 rounded-full p-2 hover:bg-base-300 transition-colors'
                        onPointerDown={handleConnectionStart}
                        aria-label="Connect output"
                        data-port="output"
                    >
                        <div className="w-2 h-2 rounded-full bg-primary" />
                    </button>
                </div>
            </div>
            <textarea
                className="w-full h-[calc(100%-4rem)] resize-none border-none focus:outline-none bg-transparent p-2"
                value={props.node.content}
                onChange={handleContentChange}
            />
        </BaseNode>
    );
} 