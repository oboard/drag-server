import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { GridBackground } from './components/GridBackground';
import { NodeTypeList } from './components/NodeTypeList';
import { useState, useCallback, useEffect } from 'react';
import { addNode, selectNodes, clearSelection, deleteSelectedNodes, addConnection, updateConnection } from './store';
import { v4 as uuidv4 } from 'uuid';
import { EDITOR_CONFIG } from './config/editor';
import "./App.css";
import { NodeFactory } from './components/NodeFactory';
import { NodeTypes } from './types/index';
import { ConnectionLine } from './components/ConnectionLine';

interface DraggingConnection {
  sourceNodeId: string;
  sourceOutputId: string;
  startPos: { x: number; y: number };
  currentPos: { x: number; y: number };
}

function App() {
  const nodes = useSelector((state: RootState) => state.flow.present.nodes);
  const connections = useSelector((state: RootState) => state.flow.present.connections);
  const selectedNodeIds = useSelector((state: RootState) => state.flow.present.selectedNodeIds);
  const [isDragging, setIsDragging] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  const [draggingConnection, setDraggingConnection] = useState<DraggingConnection | null>(null);
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

  const handleConnectionStart = useCallback((nodeId: string, outputId: string, startPos: { x: number; y: number }) => {
    console.log('App - handleConnectionStart', { nodeId, outputId, startPos });
    const canvas = document.querySelector('.editor-background')?.parentElement;
    if (!canvas) {
      console.error('App - Canvas not found');
      return;
    }
    
    const scrollLeft = canvas.scrollLeft;
    const scrollTop = canvas.scrollTop;
    
    // 获取源节点的位置
    const sourceNode = nodes.find(node => node.id === nodeId);
    if (!sourceNode) {
      console.error('App - Source node not found:', nodeId);
      return;
    }
    
    setDraggingConnection({
      sourceNodeId: nodeId,
      sourceOutputId: outputId,
      startPos: {
        x: startPos.x,
        y: startPos.y
      },
      currentPos: {
        x: startPos.x,
        y: startPos.y
      }
    });
    console.log('App - Dragging connection set');
  }, [nodes]);

  const handleConnectionMove = useCallback((e: React.MouseEvent) => {
    if (!draggingConnection) return;

    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left + canvas.scrollLeft;
    const y = e.clientY - rect.top + canvas.scrollTop;

    console.log('App - handleConnectionMove', { x, y, current: draggingConnection.currentPos });
    setDraggingConnection(prev => {
      if (!prev) return null;
      return {
        ...prev,
        currentPos: { x, y }
      };
    });
  }, [draggingConnection]);

  const handleConnectionEnd = useCallback((targetNodeId: string, targetInputId: string) => {
    console.log('App - handleConnectionEnd', {
      targetNodeId,
      targetInputId,
      draggingConnection
    });
    
    if (!draggingConnection) {
      console.log('App - No dragging connection to end');
      return;
    }

    // 检查是否是连接到自己
    if (targetNodeId === draggingConnection.sourceNodeId) {
      console.log('App - Cannot connect to self');
      setDraggingConnection(null);
      return;
    }

    // 创建连接路径
    const dx = draggingConnection.currentPos.x - draggingConnection.startPos.x;
    const dy = draggingConnection.currentPos.y - draggingConnection.startPos.y;
    const midX = draggingConnection.startPos.x + dx * 0.5;
    const path = `M ${draggingConnection.startPos.x} ${draggingConnection.startPos.y} 
                 C ${midX} ${draggingConnection.startPos.y},
                   ${midX} ${draggingConnection.currentPos.y},
                   ${draggingConnection.currentPos.x} ${draggingConnection.currentPos.y}`;

    dispatch(addConnection({
      id: uuidv4(),
      sourceNodeId: draggingConnection.sourceNodeId,
      sourceOutputId: draggingConnection.sourceOutputId,
      targetNodeId,
      targetInputId,
      path
    }));
    console.log('App - Connection added');

    setDraggingConnection(null);
  }, [draggingConnection, dispatch]);

  // 添加一个新的处理函数来处理画布上的指针事件
  const handleCanvasPointerUp = useCallback((e: React.PointerEvent) => {
    if (draggingConnection) {
      console.log('App - Canvas pointer up, clearing connection');
      setDraggingConnection(null);
    }
  }, [draggingConnection]);

  const handleNodePositionChange = useCallback((nodeId: string, x: number, y: number) => {
    // 更新与该节点相关的所有连接
    connections.forEach(connection => {
      if (connection.sourceNodeId === nodeId || connection.targetNodeId === nodeId) {
        // 找到源节点和目标节点
        const sourceNode = nodes.find(node => node.id === connection.sourceNodeId);
        const targetNode = nodes.find(node => node.id === connection.targetNodeId);
        
        if (!sourceNode || !targetNode) return;

        // 计算新的连接路径
        const startX = sourceNode.position.x + (sourceNode.size?.width || EDITOR_CONFIG.node.defaultWidth);
        const startY = sourceNode.position.y + 40; // 输出点的y位置
        const endX = targetNode.position.x;
        const endY = targetNode.position.y + 40; // 输入点的y位置
        
        const dx = endX - startX;
        const dy = endY - startY;
        const midX = startX + dx * 0.5;
        
        const path = `M ${startX} ${startY} 
                     C ${midX} ${startY},
                       ${midX} ${endY},
                       ${endX} ${endY}`;

        // 更新连接的路径
        dispatch(updateConnection({
          id: connection.id,
          path
        }));
      }
    });
  }, [connections, nodes, dispatch]);

  return (
    <div className="flex h-screen bg-base-300">
      <NodeTypeList />

      {/* 右侧画布 */}
      <div
        className="flex-1 relative overflow-scroll bg-grid-pattern select-none"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseDown={handleSelectionStart}
        onMouseMove={(e) => {
          handleSelectionMove(e);
          handleConnectionMove(e);
        }}
        onMouseUp={handleSelectionEnd}
        onMouseLeave={handleSelectionEnd}
        onPointerUp={handleCanvasPointerUp}
      >
        <div className="editor-background absolute inset-0" />
        <GridBackground visible={isDragging} />
        
        {/* 连线 */}
        {connections.map(connection => (
          <ConnectionLine key={connection.id} connection={connection} />
        ))}
        {draggingConnection && (
          <ConnectionLine
            connection={{
              id: 'preview',
              sourceNodeId: draggingConnection.sourceNodeId,
              sourceOutputId: draggingConnection.sourceOutputId,
              targetNodeId: '',
              targetInputId: '',
              path: ''
            }}
            isPreview={true}
            previewStart={draggingConnection.startPos}
            previewEnd={draggingConnection.currentPos}
          />
        )}

        {/* 节点 */}
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
            onConnectionStart={handleConnectionStart}
            onConnectionEnd={handleConnectionEnd}
            onPositionChange={handleNodePositionChange}
          />
        ))}

        {/* 选择框 */}
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
