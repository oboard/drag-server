import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { GridBackground } from './components/GridBackground';
import { NodeTypeList } from './components/NodeTypeList';
import { useState, useCallback, useEffect } from 'react';
import { addNode, selectNodes, clearSelection, deleteSelectedNodes } from './store';
import { v4 as uuidv4 } from 'uuid';
import { EDITOR_CONFIG } from './config/editor';
import "./App.css";
import { NodeFactory } from './components/NodeFactory';
import { NodeTypes } from './types/index';

function App() {
  const nodes = useSelector((state: RootState) => state.flow.present.nodes);
  const selectedNodeIds = useSelector((state: RootState) => state.flow.present.selectedNodeIds);
  const [isDragging, setIsDragging] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  const dispatch = useDispatch();

  // 处理键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果正在输入（例如在文本框中），不处理快捷键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Delete 或 Backspace 删除选中的节点
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeIds.length > 0) {
        e.preventDefault();
        dispatch(deleteSelectedNodes());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodeIds, dispatch]);

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

  const handleSelectionStart = useCallback((e: React.MouseEvent) => {
    // 只有在背景上点击时才开始选择
    if ((e.target as HTMLElement).classList.contains('editor-background')) {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left + canvas.scrollLeft;
      const y = e.clientY - rect.top + canvas.scrollTop;
      
      setIsSelecting(true);
      setSelectionStart({ x, y });
      setSelectionEnd({ x, y });
      dispatch(clearSelection());
    }
  }, [dispatch]);

  const handleSelectionMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting) return;

    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left + canvas.scrollLeft;
    const y = e.clientY - rect.top + canvas.scrollTop;
    
    setSelectionEnd({ x, y });

    // 计算选择框的边界
    const left = Math.min(selectionStart.x, x);
    const right = Math.max(selectionStart.x, x);
    const top = Math.min(selectionStart.y, y);
    const bottom = Math.max(selectionStart.y, y);

    // 检查每个节点是否在选择框内
    const selectedIds = nodes.filter(node => {
      const nodeLeft = node.position.x;
      const nodeRight = node.position.x + (node.size?.width || EDITOR_CONFIG.node.defaultWidth);
      const nodeTop = node.position.y;
      const nodeBottom = node.position.y + (node.size?.height || EDITOR_CONFIG.node.defaultHeight);

      return (
        nodeLeft < right &&
        nodeRight > left &&
        nodeTop < bottom &&
        nodeBottom > top
      );
    }).map(node => node.id);

    dispatch(selectNodes(selectedIds));
  }, [isSelecting, selectionStart, nodes, dispatch]);

  const handleSelectionEnd = useCallback(() => {
    setIsSelecting(false);
  }, []);

  return (
    <div className="flex h-screen bg-base-300">
      <NodeTypeList />

      {/* 右侧画布 */}
      <div
        className="flex-1 relative overflow-scroll bg-grid-pattern select-none"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseDown={handleSelectionStart}
        onMouseMove={handleSelectionMove}
        onMouseUp={handleSelectionEnd}
        onMouseLeave={handleSelectionEnd}
      >
        <div className="editor-background absolute inset-0" />
        <GridBackground visible={isDragging} />
        {nodes.map(node => (
          <NodeFactory
            key={node.id}
            node={node as unknown as NodeTypes}
            selected={selectedNodeIds.includes(node.id)}
            onSelect={(nodeId, multiSelect) => {
              if (multiSelect) {
                dispatch(selectNodes([...selectedNodeIds, nodeId]));
              } else {
                dispatch(selectNodes([nodeId]));
              }
            }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
          />
        ))}
        {isSelecting && (
          <div
            className="absolute border-2 border-primary bg-primary/20 pointer-events-none"
            style={{
              left: Math.min(selectionStart.x, selectionEnd.x),
              top: Math.min(selectionStart.y, selectionEnd.y),
              width: Math.abs(selectionEnd.x - selectionStart.x),
              height: Math.abs(selectionEnd.y - selectionStart.y),
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
