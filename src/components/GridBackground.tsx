interface GridBackgroundProps {
    visible: boolean;
}

export function GridBackground({ visible }: GridBackgroundProps) {
    return (
        <div
            className={`absolute inset-0 pointer-events-none transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'
                }`}
            style={{
                backgroundImage: `
                    linear-gradient(to right, rgba(128, 128, 128, 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(128, 128, 128, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px'
            }}
        />
    );
} 