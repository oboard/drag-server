import { motion, useMotionTemplate, useMotionValue, animate, useDragControls, MotionValue } from "framer-motion";
import { BaseNode as BaseNodeType, PropertyType } from "../../types/index";
import { updateNodePosition, updateNodeSize } from "../../store";
import { useDispatch } from "react-redux";
import { EDITOR_CONFIG } from '../../config/editor';
import React from 'react';
import { NodeProperties } from "./NodeProperty";

// 添加节流函数
function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
    func: T,
    limit: number
): (...args: Parameters<T>) => ReturnType<T> {
    let inThrottle = false;
    let lastResult: ReturnType<T>;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            inThrottle = true;
            lastResult = func(...args);
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
        return lastResult;
    };
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export interface BaseNodeComponentProps {
    node: BaseNodeType;
    selected: boolean;
    resizable?: boolean;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    onSelect?: (nodeId: string, multiSelect: boolean) => void;
    onPositionChange?: (nodeId: string) => void;
    onConnectionStart?: (nodeId: string, portId: string, type: PropertyType) => void;
    onConnectionEnd?: (nodeId: string, portId: string, type: PropertyType) => void;
    x?: MotionValue<number>;
    y?: MotionValue<number>;
}

const resizeHandles: { direction: ResizeDirection; className: string }[] = [
    { direction: 'n', className: 'top-0 left-1/2 -translate-x-1/2 h-2 w-full cursor-n-resize' },
    { direction: 's', className: 'bottom-0 left-1/2 -translate-x-1/2 h-2 w-full cursor-s-resize' },
    { direction: 'e', className: 'right-0 top-1/2 -translate-y-1/2 w-2 h-full cursor-e-resize' },
    { direction: 'w', className: 'left-0 top-1/2 -translate-y-1/2 w-2 h-full cursor-w-resize' },
    { direction: 'ne', className: 'top-0 right-0 h-2 w-2 cursor-ne-resize' },
    { direction: 'nw', className: 'top-0 left-0 h-2 w-2 cursor-nw-resize' },
    { direction: 'se', className: 'bottom-0 right-0 h-2 w-2 cursor-se-resize' },
    { direction: 'sw', className: 'bottom-0 left-0 h-2 w-2 cursor-sw-resize' }
];

export function BaseNodeComponent({
    node,
    selected,
    resizable = false,
    onDragStart,
    onDragEnd,
    onSelect,
    onPositionChange,
    onConnectionStart,
    onConnectionEnd,
    x: externalX,
    y: externalY,
    children
}: BaseNodeComponentProps & { children?: React.ReactNode }) {
    const dispatch = useDispatch();
    const x = externalX || useMotionValue(node.position.x);
    const y = externalY || useMotionValue(node.position.y);
    const nodeWidth = useMotionValue(node.size?.width || EDITOR_CONFIG.node.defaultWidth);
    const nodeHeight = useMotionValue(node.size?.height || EDITOR_CONFIG.node.defaultHeight);
    const transform = useMotionTemplate`translate3d(${x}px, ${y}px, 0)`;
    const dragControls = useDragControls();
    const [resizeDirection, setResizeDirection] = React.useState<ResizeDirection | null>(null);

    // 使用 useCallback 和 throttle 来优化位置更新
    const throttledPositionChange = React.useCallback(
        throttle((nodeId: string) => {
            onPositionChange?.(nodeId);
        }, 8),
        []
    );

    const handleResize = React.useCallback((e: PointerEvent) => {
        if (!resizeDirection) return;

        const movementX = e.movementX;
        const movementY = e.movementY;

        let newWidth = nodeWidth.get();
        let newHeight = nodeHeight.get();
        let newX = x.get();
        let newY = y.get();

        // 处理水平方向
        if (resizeDirection.includes('e')) {
            newWidth = Math.max(EDITOR_CONFIG.node.minWidth, newWidth + movementX);
        } else if (resizeDirection.includes('w')) {
            const possibleWidth = newWidth - movementX;
            if (possibleWidth >= EDITOR_CONFIG.node.minWidth) {
                newWidth = possibleWidth;
                newX += movementX;
            }
        }

        // 处理垂直方向
        if (resizeDirection.includes('s')) {
            newHeight = Math.max(EDITOR_CONFIG.node.minHeight, newHeight + movementY);
        } else if (resizeDirection.includes('n')) {
            const possibleHeight = newHeight - movementY;
            if (possibleHeight >= EDITOR_CONFIG.node.minHeight) {
                newHeight = possibleHeight;
                newY += movementY;
            }
        }

        nodeWidth.set(newWidth);
        nodeHeight.set(newHeight);
        x.set(newX);
        y.set(newY);

        throttledPositionChange(node.id);
    }, [resizeDirection, nodeWidth, nodeHeight, x, y, node.id, throttledPositionChange]);

    const snapToGrid = React.useCallback((value: number) => {
        return Math.round(value / EDITOR_CONFIG.grid.size) * EDITOR_CONFIG.grid.size;
    }, []);

    const animateToPosition = React.useCallback((targetX: number, targetY: number) => {
        animate(x, targetX, {
            type: "spring",
            stiffness: 300,
            damping: 30,
            onUpdate: () => throttledPositionChange(node.id)
        });
        animate(y, targetY, {
            type: "spring",
            stiffness: 300,
            damping: 30,
            onUpdate: () => throttledPositionChange(node.id)
        });
    }, [x, y, node.id, throttledPositionChange]);

    const handleResizeEnd = React.useCallback(() => {
        if (!resizeDirection) return;

        const snappedWidth = snapToGrid(nodeWidth.get());
        const snappedHeight = snapToGrid(nodeHeight.get());
        const snappedX = snapToGrid(x.get());
        const snappedY = snapToGrid(y.get());

        // 动画过渡到对齐位置
        animate(nodeWidth, snappedWidth, {
            type: "spring", stiffness: 300, damping: 30,
            onUpdate: () => throttledPositionChange(node.id)
        });
        animate(nodeHeight, snappedHeight, {
            type: "spring", stiffness: 300, damping: 30,
            onUpdate: () => throttledPositionChange(node.id)
        });
        animateToPosition(snappedX, snappedY);

        // 更新 store
        dispatch(updateNodeSize({ id: node.id, width: snappedWidth, height: snappedHeight }));
        dispatch(updateNodePosition({ id: node.id, x: snappedX, y: snappedY }));

        setResizeDirection(null);
    }, [resizeDirection, node.id, dispatch, nodeWidth, nodeHeight, x, y, snapToGrid, animateToPosition, throttledPositionChange]);

    React.useEffect(() => {
        if (resizeDirection) {
            window.addEventListener('pointermove', handleResize);
            window.addEventListener('pointerup', handleResizeEnd);
        }
        return () => {
            window.removeEventListener('pointermove', handleResize);
            window.removeEventListener('pointerup', handleResizeEnd);
        };
    }, [resizeDirection, handleResize, handleResizeEnd]);

    return (
        <motion.div
            data-node
            data-node-id={node.id}
            className={`absolute min-w-48 min-h-48 bg-base-100 shadow-lg select-none rounded-lg ${selected ? 'ring-2 ring-primary' : ''}`}
            drag
            _dragX={x}
            _dragY={y}
            dragConstraints={{ top: 0, left: 0 }}
            dragListener={false}
            dragControls={dragControls}
            dragElastic={0.1}
            dragMomentum={false}
            style={{ transform, width: nodeWidth, height: nodeHeight }}
            onDragStart={onDragStart}
            onDrag={() => throttledPositionChange(node.id)}
            onDragEnd={() => {
                onDragEnd?.();
                const snappedX = snapToGrid(x.get());
                const snappedY = snapToGrid(y.get());
                animateToPosition(snappedX, snappedY);
                dispatch(updateNodePosition({ id: node.id, x: snappedX, y: snappedY }));
            }}
            onMouseDown={(e) => {
                if ((e.target as HTMLElement).getAttribute('role') === 'button') return;
                onSelect?.(node.id, e.shiftKey);
            }}
            onFocus={() => onSelect?.(node.id, false)}
            tabIndex={0}
        >
            <div
                onPointerDown={(e) => dragControls.start(e)}
                className="p-1 bg-base-200 rounded-t-lg flex items-center justify-center"
            >
                {node.name}
            </div>
            <div className="relative flex flex-col w-full h-[calc(100%-2.5rem)]">
                {node.outputs && node.outputs.length > 0 &&
                    <div className="relative z-10">
                        <NodeProperties
                            type='output'
                            ports={node.outputs}
                            nodeId={node.id}
                            onConnectionStart={onConnectionStart}
                            onConnectionEnd={onConnectionEnd}
                        />
                    </div>
                }
                {children}
                {node.inputs && node.inputs.length > 0 &&
                    <div className="relative z-10 my-2">
                        <NodeProperties
                            type='input'
                            ports={node.inputs}
                            nodeId={node.id}
                            onConnectionStart={onConnectionStart}
                            onConnectionEnd={onConnectionEnd}
                        />
                    </div>
                }
            </div>
            <div className="absolute inset-0 pointer-events-none">
                {resizable && resizeHandles.map(({ direction, className }) => (
                    <div
                        key={direction}
                        className={`absolute bg-transparent hover:bg-primary/20 rounded-full pointer-events-auto ${className}`}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            setResizeDirection(direction);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setResizeDirection(direction);
                            }
                        }}
                        aria-label={`Resize ${direction}`}
                    />
                ))}
            </div>
        </motion.div>
    );
}