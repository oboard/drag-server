import React from 'react';
import { PropertyInfo } from 'types';
import clsx from 'clsx';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updatePortValue } from '../../store/slices/flowSlice';

interface NodePortProps {
    property: PropertyInfo;
    type: 'input' | 'output';
    nodeId: string;
    onConnectionStart?: (nodeId: string, portId: string, startPos: { x: number; y: number }) => void;
    onConnectionEnd?: (nodeId: string, portId: string) => void;
}

export function NodePropertyComponent({ property, type, nodeId, onConnectionStart, onConnectionEnd }: NodePortProps) {
    const [isHovering, setIsHovering] = React.useState(false);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const dispatch = useDispatch();
    const connections = useSelector((state: RootState) => state.flow.present.connections);
    const portValue = useSelector((state: RootState) =>
        state.flow.present.properties[nodeId]?.[property.id] ?? ''
    );

    // 检查端口是否已连接
    const isConnected = React.useMemo(() => {
        return connections.some(conn =>
            (type === 'input' && conn.targetNodeId === nodeId && conn.targetInputId === property.id) ||
            (type === 'output' && conn.sourceNodeId === nodeId && conn.sourceOutputId === property.id)
        );
    }, [connections, nodeId, property.id, type]);

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
            onConnectionStart?.(nodeId, property.id, pos);
        } else {
            onConnectionEnd?.(nodeId, property.id);
        }
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = property.type === 'number' ? Number(e.target.value) : e.target.value;
        dispatch(updatePortValue({ nodeId, portId: property.id, value }));
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
                        aria-label={`Connect ${property.type}`}
                        data-property={property.id}
                        data-property-type={property.type}
                        data-node-id={nodeId}
                    />
                    <span>{property.name}</span>
                    {!isConnected && (
                        property.type === 'string' ? (
                            <input
                                type="text"
                                className="input input-xs input-bordered w-24"
                                placeholder={property.name}
                                value={portValue}
                                onChange={handleValueChange}
                            />
                        ) : property.type === 'number' ? (
                            <input
                                type="number"
                                className="input input-xs input-bordered w-24"
                                placeholder={property.name}
                                value={portValue}
                                onChange={handleValueChange}
                            />
                        ) : null
                    )}
                </>
            )}
            {type === 'output' && (
                <>
                    <span>{property.name}</span>
                    <button
                        ref={buttonRef}
                        type='button'
                        className='bg-primary rounded-full w-4 h-4 hover:bg-secondary transition-colors'
                        onPointerDown={handleConnectionEvent}
                        aria-label={`Connect ${property.type}`}
                        data-property={property.id}
                        data-property-type={property.type}
                        data-node-id={nodeId}
                    />
                </>
            )}
        </div>
    );
}

export function NodeProperties({
    ports: properties,
    type,
    nodeId,
    onConnectionStart,
    onConnectionEnd
}: {
    ports: PropertyInfo[];
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
                {properties.map(property => (
                    <NodePropertyComponent
                        key={property.id}
                        property={property}
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