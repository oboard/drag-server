import { NodeTypeEnum } from '../types/index';
import { NodeTypeListItem, NodeTypeListItemProps } from './NodeTypeListItem';

export const nodeTypes = [
    {
        type: NodeTypeEnum.TEXT,
        name: "文本",
        icon: "📄",
        description: "文本节点"
    },
    {
        type: NodeTypeEnum.LOG,
        name: "日志",
        icon: "📝",
        description: "日志输出节点"
    },
    {
        type: NodeTypeEnum.ROUTER,
        name: "路由",
        icon: "🔄",
        description: "路由节点"
    },
    {
        type: NodeTypeEnum.PORT,
        name: "端口",
        icon: "🔌",
        description: "端口节点"
    },
    {
        type: NodeTypeEnum.JSON,
        name: "JSON",
        icon: "🔍",
        description: "JSON 数据节点"
    }
] as NodeTypeListItemProps[];

export function NodeTypeList() {
    return (
        <div className="w-64 bg-base-200 p-4 overflow-y-auto border-r border-base-300">
            <h2 className="text-xl font-bold mb-4">节点列表</h2>
            <div className="space-y-2">
                {nodeTypes.map(nodeType => (
                    <NodeTypeListItem
                        key={nodeType.type}
                        {...nodeType}
                    />
                ))}
            </div>
        </div>
    );
} 