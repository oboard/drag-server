import { BaseNodeComponent, BaseNodeComponentProps } from './BaseNode';
import { useDispatch } from 'react-redux';
import { updateNodeContent } from '../../store';
import { useState, useEffect } from 'react';

export function TextNodeComponent(props: BaseNodeComponentProps) {
    const dispatch = useDispatch();
    const [wordCount, setWordCount] = useState(0);

    // 计算字数
    useEffect(() => {
        // 移除空白字符后计算字数
        const count = props.node.content.replace(/\s/g, '').length;
        setWordCount(count);
    }, [props.node.content]);

    return (
        <BaseNodeComponent resizable={true} {...props}>
            <div className='w-full h-full p-2 flex flex-col'>
                <textarea
                    className="w-full flex-1 resize-none border-none focus:outline-none bg-base-200 rounded-lg p-2"
                    value={props.node.content}
                    onChange={e => dispatch(updateNodeContent({
                        id: props.node.id,
                        content: e.target.value
                    }))}
                />
                <div className="text-right text-sm text-base-content/50 mt-1">
                    字数：{wordCount}
                </div>
            </div>
        </BaseNodeComponent>
    );
}