import { NodeTypeListItem, NodeTypeListItemProps } from './NodeTypeListItem';

const nodeTypes = [
    {
        id: "text",
        type: "text",
        name: "文本节点",
        icon: "📝",
        description: "文本输入节点"
    },
    {
        id: "logger",
        type: "log",
        name: "日志节点",
        icon: "📝",
        description: "日志输出节点"
    }
] as NodeTypeListItemProps[];

export function NodeTypeList() {
    return (
        <div className="w-64 bg-base-200 p-4 overflow-y-auto border-r border-base-300">
            <h2 className="text-xl font-bold mb-4">节点列表</h2>
            <div className="space-y-2">
                {nodeTypes.map(nodeType => (
                    <NodeTypeListItem
                        key={nodeType.id}
                        {...nodeType}
                    />
                ))}
            </div>
        </div>
    );
} 