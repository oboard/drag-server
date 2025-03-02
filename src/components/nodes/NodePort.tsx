import React from 'react';

export interface Port {
    id: string;
    name: string;
    type: 'input' | 'output';
}

interface NodePortProps {
    port: Port;
    nodeId: string;
    onConnectionStart?: (nodeId: string, portId: string, startPos: { x: number; y: number }) => void;
    onConnectionEnd?: (nodeId: string, portId: string) => void;
}

export function NodePort({ port, nodeId, onConnectionStart, onConnectionEnd }: NodePortProps) {
    const [isHovering, setIsHovering] = React.useState(false);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    const handleConnectionEvent = (e: React.PointerEvent<HTMLButtonElement>) => {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const canvas = button.closest('.overflow-scroll');
        if (!canvas) return;

        const canvasRect = canvas.getBoundingClientRect();
        const pos = {
            x: rect.left + rect.width / 2 - canvasRect.left + canvas.scrollLeft,
            y: rect.top + rect.height / 2 - canvasRect.top + canvas.scrollTop
        };

        if (port.type === 'output') {
            onConnectionStart?.(nodeId, port.id, pos);
        } else {
            onConnectionEnd?.(nodeId, port.id);
        }
    };

    return (
        <div className={`flex items-center gap-2 ${port.type === 'output' ? 'justify-end' : ''}`}>
            {port.type === 'input' && (
                <button
                    ref={buttonRef}
                    type='button'
                    className='bg-primary rounded-full w-4 h-4 hover:bg-secondary transition-colors'
                    onPointerUp={handleConnectionEvent}
                    onPointerDown={handleConnectionEvent}
                    onPointerEnter={() => setIsHovering(true)}
                    onPointerLeave={() => setIsHovering(false)}
                    data-hovering={isHovering}
                    aria-label={`Connect ${port.type}`}
                    data-port={port.id}
                    data-port-type={port.type}
                    data-node-id={nodeId}
                />
            )}
            <span>{port.name}</span>
            {port.type === 'output' && (
                <button
                    ref={buttonRef}
                    type='button'
                    className='bg-primary rounded-full w-4 h-4 hover:bg-secondary transition-colors'
                    onPointerDown={handleConnectionEvent}
                    aria-label={`Connect ${port.type}`}
                    data-port={port.id}
                    data-port-type={port.type}
                    data-node-id={nodeId}
                />
            )}
        </div>
    );
}

export function NodePorts({
    ports,
    nodeId,
    onConnectionStart,
    onConnectionEnd
}: {
    ports: Port[];
    nodeId: string;
    onConnectionStart?: (nodeId: string, portId: string, startPos: { x: number; y: number }) => void;
    onConnectionEnd?: (nodeId: string, portId: string) => void;
}) {
    const inputPorts = ports.filter(port => port.type === 'input');
    const outputPorts = ports.filter(port => port.type === 'output');

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2 translate-x-[-8px]">
                {inputPorts.map(port => (
                    <NodePort
                        key={port.id}
                        port={port}
                        nodeId={nodeId}
                        onConnectionStart={onConnectionStart}
                        onConnectionEnd={onConnectionEnd}
                    />
                ))}
            </div>
            <div className="flex flex-col gap-2 translate-x-[8px]">
                {outputPorts.map(port => (
                    <NodePort
                        key={port.id}
                        port={port}
                        nodeId={nodeId}
                        onConnectionStart={onConnectionStart}
                        onConnectionEnd={onConnectionEnd}
                    />
                ))}
            </div>
        </div>
    );
} 