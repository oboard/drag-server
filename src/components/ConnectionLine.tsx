import { Connection } from '../types';

interface ConnectionLineProps {
    connection: Connection;
    isPreview?: boolean;
    previewStart?: { x: number; y: number };
    previewEnd?: { x: number; y: number };
}

export function ConnectionLine({ connection, isPreview, previewStart, previewEnd }: ConnectionLineProps) {
    if (isPreview && previewStart && previewEnd) {
        console.log('ConnectionLine - Drawing preview', { previewStart, previewEnd });
        // 绘制预览连线
        const dx = previewEnd.x - previewStart.x;
        // const dy = previewEnd.y - previewStart.y;
        const midX = previewStart.x + dx * 0.5;

        // 使用三次贝塞尔曲线创建平滑的连线
        const path = `M ${previewStart.x} ${previewStart.y} 
                     C ${midX} ${previewStart.y},
                       ${midX} ${previewEnd.y},
                       ${previewEnd.x} ${previewEnd.y}`;

        return (
            <svg
                className="absolute inset-0 pointer-events-none"
                role="presentation"
                aria-hidden="true"
                width="100%"
                height="100%"
            >
                <path
                    d={path}
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-primary"
                />
            </svg>
        );
    }

    // 绘制实际连线
    return (
        <svg
            className="absolute inset-0 pointer-events-none"
            role="presentation"
            aria-hidden="true"
            width="100%"
            height="100%"
        >
            <path
                d={connection.path}
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-primary"
            />
        </svg>
    );
} 