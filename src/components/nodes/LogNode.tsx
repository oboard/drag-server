import { BaseNodeComponent, BaseNodeComponentProps } from './BaseNodeComponent';

export function LogNodeComponent(props: BaseNodeComponentProps) {
    return (
        <BaseNodeComponent {...props} resizable={true}>
            <div className="w-full flex-1 p-2 bg-base-200 rounded-lg">
                <p className='text-sm'>
                    {props.node.content}
                </p>
            </div>
        </BaseNodeComponent>
    );
}