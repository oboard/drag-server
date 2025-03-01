import { EDITOR_CONFIG } from '../config/editor';

interface GridBackgroundProps {
    visible: boolean;
}

export function GridBackground({ visible }: GridBackgroundProps) {
    return (
        <div
            className={`absolute h-full w-full inset-0 pointer-events-none transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
            style={{
                backgroundImage: `
                    linear-gradient(to right, ${EDITOR_CONFIG.grid.color} 1px, transparent 1px),
                    linear-gradient(to bottom, ${EDITOR_CONFIG.grid.color} 1px, transparent 1px)
                `,
                backgroundSize: `${EDITOR_CONFIG.grid.size}px ${EDITOR_CONFIG.grid.size}px`
            }}
        />
    );
} 