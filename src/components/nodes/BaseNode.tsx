import { motion, useMotionTemplate, useMotionValue, animate, useDragControls, MotionValue } from "framer-motion";
import { BaseNode as BaseNodeType } from "../../types/index";
import { updateNodePosition, updateNodeSize } from "../../store";
import { useDispatch } from "react-redux";
import { EDITOR_CONFIG } from '../../config/editor';
import React from 'react';

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export interface BaseNodeProps {
    node: BaseNodeType;
    selected: boolean;
    resizable?: boolean;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    onSelect?: (nodeId: string, multiSelect: boolean) => void;
    onPositionChange?: (nodeId: string, x: number, y: number) => void;
    x?: MotionValue<number>;
    y?: MotionValue<number>;
}

export function BaseNode({
    node,
    selected,
    resizable = false,
    onDragStart,
    onDragEnd,
    onSelect,
    onPositionChange,
    x: externalX,
    y: externalY,
    children
}: BaseNodeProps & { children: React.ReactNode }) {
    const dispatch = useDispatch();
    const x = externalX || useMotionValue(node.position.x);
    const y = externalY || useMotionValue(node.position.y);
    const nodeWidth = useMotionValue(node.size?.width || EDITOR_CONFIG.node.defaultWidth);
    const nodeHeight = useMotionValue(node.size?.height || EDITOR_CONFIG.node.defaultHeight);
    const transform = useMotionTemplate`translate3d(${x}px, ${y}px, 0)`;
    const dragControls = useDragControls();
    const [resizeDirection, setResizeDirection] = React.useState<ResizeDirection | null>(null);

    const startDrag = (e: React.PointerEvent) => {
        dragControls.start(e);
    }

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
    }, [resizeDirection, nodeWidth, nodeHeight, x, y]);

    const handleResizeEnd = React.useCallback(() => {
        if (!resizeDirection) return;

        const snappedWidth = Math.round(nodeWidth.get() / EDITOR_CONFIG.grid.size) * EDITOR_CONFIG.grid.size;
        const snappedHeight = Math.round(nodeHeight.get() / EDITOR_CONFIG.grid.size) * EDITOR_CONFIG.grid.size;
        const snappedX = Math.round(x.get() / EDITOR_CONFIG.grid.size) * EDITOR_CONFIG.grid.size;
        const snappedY = Math.round(y.get() / EDITOR_CONFIG.grid.size) * EDITOR_CONFIG.grid.size;

        // 动画过渡到对齐位置
        animate(nodeWidth, snappedWidth, {
            type: "spring",
            stiffness: 300,
            damping: 30
        });
        animate(nodeHeight, snappedHeight, {
            type: "spring",
            stiffness: 300,
            damping: 30
        });
        animate(x, snappedX, {
            type: "spring",
            stiffness: 300,
            damping: 30
        });
        animate(y, snappedY, {
            type: "spring",
            stiffness: 300,
            damping: 30
        });

        // 更新 store
        dispatch(updateNodeSize({
            id: node.id,
            width: snappedWidth,
            height: snappedHeight
        }));
        dispatch(updateNodePosition({
            id: node.id,
            x: snappedX,
            y: snappedY
        }));

        setResizeDirection(null);
    }, [resizeDirection, node.id, dispatch, nodeWidth, nodeHeight, x, y]);

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

    return (
        <motion.div
            data-node
            className={`absolute min-w-48 min-h-48 bg-base-100 shadow-lg select-none rounded-lg overflow-hidden ${selected ? 'ring-2 ring-primary' : ''}`}
            drag
            _dragX={x}
            _dragY={y}
            dragConstraints={{
                top: 0,
                left: 0
            }}
            dragListener={false}
            dragControls={dragControls}
            dragElastic={0.1}
            dragMomentum={false}
            style={{
                transform,
                width: nodeWidth,
                height: nodeHeight
            }}
            onDragStart={onDragStart}
            onDragEnd={() => {
                onDragEnd?.();
                const snappedX = Math.round(x.get() / EDITOR_CONFIG.grid.size) * EDITOR_CONFIG.grid.size;
                const snappedY = Math.round(y.get() / EDITOR_CONFIG.grid.size) * EDITOR_CONFIG.grid.size;

                animate(x, snappedX, {
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                });
                animate(y, snappedY, {
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                });

                dispatch(updateNodePosition({ id: node.id, x: snappedX, y: snappedY }));
                onPositionChange?.(node.id, snappedX, snappedY);
            }}
            onMouseDown={(e) => {
                // 如果点击的是调整大小的手柄，不触发选择
                if ((e.target as HTMLElement).getAttribute('role') === 'button') {
                    return;
                }
                onSelect?.(node.id, e.shiftKey);
            }}
            onFocus={() => onSelect?.(node.id, false)}
            tabIndex={0}
        >
            <div
                onPointerDown={startDrag}
                className="h-10 bg-base-200 flex items-center justify-center">
                {node.name}
            </div>
            <div className="relative flex flex-col w-full h-[calc(100%-2.5rem)]">
                {children}
            </div>
            {resizable && resizeHandles.map(({ direction, className }) => (
                <div
                    key={direction}
                    className={`absolute bg-transparent hover:bg-base-300 z-10 ${className}`}
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
        </motion.div>
    );
} 