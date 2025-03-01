import { Node } from "./components/Node";
import { useSelector } from 'react-redux';
import { RootState } from './store';
import { GridBackground } from './components/GridBackground';
import { useState } from 'react';
import "./App.css";

function App() {
  const nodes = useSelector((state: RootState) => state.flow.nodes);
  const [isDragging, setIsDragging] = useState(false);

  // 可用节点类型列表
  const nodeTypes = [
    {
      id: "input",
      type: "input",
      name: "输入节点",
      icon: "📥",
      description: "网络数据输入节点"
    },
    {
      id: "filter",
      type: "filter",
      name: "过滤节点",
      icon: "🔍",
      description: "过滤特定数据包"
    },
    {
      id: "modify",
      type: "modify",
      name: "修改节点",
      icon: "✏️",
      description: "修改数据包内容"
    },
    {
      id: "output",
      type: "output",
      name: "输出节点",
      icon: "📤",
      description: "网络数据输出节点"
    },
    {
      id: "logger",
      type: "logger",
      name: "日志节点",
      icon: "📝",
      description: "记录数据包信息"
    }
  ] as const;

  return (
    <div className="flex h-screen bg-base-300">
      {/* 左侧面板 - 节点类型列表 */}
      <div className="w-64 bg-base-200 p-4 overflow-y-auto border-r border-base-300">
        <h2 className="text-xl font-bold mb-4">节点列表</h2>
        <div className="space-y-2">
          {nodeTypes.map(nodeType => (
            <div
              key={nodeType.id}
              className="card bg-base-100 shadow-md cursor-move select-none"
            >
              <div className="card-body p-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-2 select-none">{nodeType.icon}</span>
                  <div>
                    <h3 className="font-medium select-none">{nodeType.name}</h3>
                    <p className="text-xs text-base-content/70 select-none">{nodeType.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧画布 */}
      <div
        className="flex-1 relative overflow-scroll bg-grid-pattern select-none"
      >
        <GridBackground visible={isDragging} />
        {nodes.map(node => (
          <Node
            key={node.id}
            node={node}
            selected={false}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
