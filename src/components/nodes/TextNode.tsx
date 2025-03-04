import { BaseNodeComponent, BaseNodeComponentProps } from './BaseNodeComponent';
import { useDispatch } from 'react-redux';
import { updateNodeContent } from '../../store';

export function TextNodeComponent(props: BaseNodeComponentProps) {
    const dispatch = useDispatch();

    return (
        <BaseNodeComponent resizable={true} {...props}>
            <div className='w-full h-full p-2'>
                <textarea
                    className="w-full h-full resize-none border-none focus:outline-none bg-base-200 rounded-lg p-2"
                    value={props.node.content}
                    onChange={e => dispatch(updateNodeContent({
                        id: props.node.id,
                        content: e.target.value
                    }))}
                />
            </div>
        </BaseNodeComponent>
    );
}