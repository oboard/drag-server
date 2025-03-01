import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { GridBackground } from './components/GridBackground';
import { NodeTypeList } from './components/NodeTypeList';
import { useState } from 'react';
import { addNode } from './store';
import { v4 as uuidv4 } from 'uuid';
import { EDITOR_CONFIG } from './config/editor';
import "./App.css";
import { NodeFactory } from './components/NodeFactory';
import { NodeTypes } from './types/index';

function App() {
  const nodes = useSelector((state: RootState) => state.flow.present.nodes);
  const [isDragging, setIsDragging] = useState(false);
  const dispatch = useDispatch();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));

      // 获取相对于画布的放置位置
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 对齐到网格
      const snappedX = Math.round(x / EDITOR_CONFIG.grid.size) * EDITOR_CONFIG.grid.size;
      const snappedY = Math.round(y / EDITOR_CONFIG.grid.size) * EDITOR_CONFIG.grid.size;

      // 创建新节点
      const newNode = {
        id: uuidv4(),
        type: data.type,
        name: data.name,
        position: { x: snappedX, y: snappedY },
        inputs: [],
        outputs: [],
        size: { width: EDITOR_CONFIG.node.defaultWidth, height: EDITOR_CONFIG.node.defaultHeight }
      };

      dispatch(addNode(newNode));
    } catch (error) {
      console.error('Error dropping node:', error);
    }
  };

  return (
    <div className="flex h-screen bg-base-300">
      <NodeTypeList />

      {/* 右侧画布 */}
      <div
        className="flex-1 relative overflow-scroll bg-grid-pattern select-none editor-container"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <GridBackground visible={isDragging} />
        {nodes.map(node => (
          <NodeFactory
            key={node.id}
            node={node as unknown as NodeTypes}
            selected={false}
            onSelect={() => { }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
