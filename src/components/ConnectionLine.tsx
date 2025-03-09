import { Connection, PropertyType } from '../types';

interface ConnectionLineProps {
    connection: Connection;
    isPreview?: boolean;
    previewStart?: { x: number; y: number };
    previewEnd?: { x: number; y: number };
    propertyType: PropertyType;
}

export function ConnectionLine({ connection, isPreview, previewStart, previewEnd, propertyType }: ConnectionLineProps) {
    // 获取颜色值而不是 CSS 类名
    const getStrokeColor = (type: PropertyType): string => {
        switch (type) {
            case 'string':
                return '#3B82F6'; // blue-500
            case 'response':
                return '#10B981'; // green-500
            case 'number':
                return '#8B5CF6'; // purple-500
            case 'json':
                return '#EAB308'; // yellow-500
            default:
                return '#6B7280'; // gray-500
        }
    };

    if (isPreview && previewStart && previewEnd) {
        const dx = previewEnd.x - previewStart.x;
        const midX = previewStart.x + dx * 0.5;

        const path = `M ${previewStart.x} ${previewStart.y} 
                     C ${midX} ${previewStart.y},
                       ${midX} ${previewEnd.y},
                       ${previewEnd.x} ${previewEnd.y}`;

        return (
            <svg
                className="absolute inset-0 pointer-events-none"
                role="presentation"
                aria-hidden="true"
                aria-label="Preview Connection Line"
                width="100%"
                height="100%"
            >
                <path
                    d={path}
                    stroke={getStrokeColor(propertyType)}
                    strokeWidth="2"
                    fill="none"
                />
            </svg>
        );
    }

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
                stroke={getStrokeColor(connection.type)}
                strokeWidth="2"
                fill="none"
            />
        </svg>
    );
}