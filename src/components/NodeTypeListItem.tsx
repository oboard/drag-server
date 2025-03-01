import { NodeTypeEnum } from "types/index";

export interface NodeTypeListItemProps {
    id: string;
    type: NodeTypeEnum;
    name: string;
    icon: string;
    description: string;
}

export function NodeTypeListItem({ id, type, name, icon, description }: NodeTypeListItemProps) {
    const handleDragStart = (e: React.DragEvent) => {
        // 设置拖拽数据
        e.dataTransfer.setData('application/json', JSON.stringify({
            id,
            type,
            name,
            icon,
            description,
        }));
        // 设置拖拽效果
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className="card bg-base-100 shadow-md cursor-move select-none hover:shadow-xl transition-shadow"
        >
            <div className="card-body p-3">
                <div className="flex items-center">
                    <span className="text-2xl mr-2 select-none">{icon}</span>
                    <div>
                        <h3 className="font-medium select-none">{name}</h3>
                        <p className="text-xs text-base-content/70 select-none">{description}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
