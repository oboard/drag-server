import { BaseNode, BaseNodeProps } from './BaseNode';
import { TextNode } from 'types/index';
import { useDispatch } from 'react-redux';
import { updateNodeContent } from '../../store';

interface TextNodeProps extends Omit<BaseNodeProps, 'node'> {
    node: TextNode;
}

export function TextNodeComponent(props: TextNodeProps) {
    const dispatch = useDispatch();

    const handleContentChange = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        dispatch(updateNodeContent({
            id: props.node.id,
            content: e.target.value
        }));
    };

    return (
        <BaseNode {...props}>
            <textarea
                className="w-full h-full resize-none border-none focus:outline-none bg-transparent p-2"
                value={props.node.content}
                onChange={handleContentChange}
            />
        </BaseNode>
    );
} 