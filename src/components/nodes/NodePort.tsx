import React from 'react';
import { Port } from 'types';
import clsx from 'clsx';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updatePortValue } from '../../store/slices/flowSlice';

interface NodePortProps {
    port: Port;
    type: 'input' | 'output';
    nodeId: string;
    onConnectionStart?: (nodeId: string, portId: string, startPos: { x: number; y: number }) => void;
    onConnectionEnd?: (nodeId: string, portId: string) => void;
}

export function NodePortComponent({ port, type, nodeId, onConnectionStart, onConnectionEnd }: NodePortProps) {
    const [isHovering, setIsHovering] = React.useState(false);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const dispatch = useDispatch();
    const connections = useSelector((state: RootState) => state.flow.present.connections);
    const portValue = useSelector((state: RootState) => 
        state.flow.present.portValues[nodeId]?.[port.id] ?? ''
    );

    // 检查端口是否已连接
    const isConnected = React.useMemo(() => {
        return connections.some(conn =>
            (type === 'input' && conn.targetNodeId === nodeId && conn.targetInputId === port.id) ||
            (type === 'output' && conn.sourceNodeId === nodeId && conn.sourceOutputId === port.id)
        );
    }, [connections, nodeId, port.id, type]);

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

        if (type === 'output') {
            onConnectionStart?.(nodeId, port.id, pos);
        } else {
            onConnectionEnd?.(nodeId, port.id);
        }
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = port.type === 'number' ? Number(e.target.value) : e.target.value;
        dispatch(updatePortValue({ nodeId, portId: port.id, value }));
    };

    return (
        <div className={clsx(["flex items-center gap-2"], {
            "justify-end": type === 'output',
            "justify-start": type === 'input',
        })}>
            {type === 'input' && (
                <>
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
                    <span>{port.name}</span>
                    {!isConnected && (
                        port.type === 'string' ? (
                            <input
                                type="text"
                                className="input input-xs input-bordered w-24"
                                placeholder={port.name}
                                value={portValue}
                                onChange={handleValueChange}
                            />
                        ) : port.type === 'number' ? (
                            <input
                                type="number"
                                className="input input-xs input-bordered w-24"
                                placeholder={port.name}
                                value={portValue}
                                onChange={handleValueChange}
                            />
                        ) : null
                    )}
                </>
            )}
            {type === 'output' && (
                <>
                    <span>{port.name}</span>
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
                </>
            )}
        </div>
    );
}

export function NodePorts({
    ports,
    type,
    nodeId,
    onConnectionStart,
    onConnectionEnd
}: {
    ports: Port[];
    type: 'input' | 'output';
    nodeId: string;
    onConnectionStart?: (nodeId: string, portId: string, startPos: { x: number; y: number }) => void;
    onConnectionEnd?: (nodeId: string, portId: string) => void;
}) {
    return (
        <div className="flex flex-col gap-2">
            <div className={clsx(["flex flex-col gap-2"], {
                "translate-x-[8px]": type === 'output',
                "translate-x-[-8px]": type === 'input',
            })}>
                {ports.map(port => (
                    <NodePortComponent
                        key={port.id}
                        port={port}
                        type={type}
                        nodeId={nodeId}
                        onConnectionStart={onConnectionStart}
                        onConnectionEnd={onConnectionEnd}
                    />
                ))}
            </div>
        </div>
    );
} 