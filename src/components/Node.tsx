import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion";
import { Node as NodeType } from "../types";
import { updateNodePosition } from "../store";
import { useDispatch } from "react-redux";

interface NodeProps {
    node: NodeType;
    selected: boolean;
    onDragStart?: () => void;
    onDragEnd?: () => void;
}

export function Node({
    node,
    selected,
    onDragStart,
    onDragEnd,
}: NodeProps) {
    const x = useMotionValue(node.position.x);
    const y = useMotionValue(node.position.y);
    const transform = useMotionTemplate`translate3d(${x}px, ${y}px, 0)`;
    const dispatch = useDispatch();

    return (
        <motion.div
            className={`absolute card w-48 bg-base-100 shadow-lg select-none ${selected ? 'ring-2 ring-primary' : ''}`}
            drag
            _dragX={x}
            _dragY={y}
            dragConstraints={{
                top: 0,
                left: 0
            }}
            dragElastic={0.1}
            dragMomentum={false}
            style={{ transform }}
            onDragStart={() => {
                onDragStart?.();
            }}
            onDragEnd={() => {
                onDragEnd?.();
                // 对其网格
                const gridSize = 50;
                const snappedX = Math.round(x.get() / gridSize) * gridSize;
                const snappedY = Math.round(y.get() / gridSize) * gridSize;

                // 添加平滑动画
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
            }}>
            <div className="card-body">
                <h2 className="card-title">{node.name}</h2>
            </div>
        </motion.div>
    );
} 