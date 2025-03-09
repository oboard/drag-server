import React from 'react';
import { PropertyInfo, PropertyType } from '../../types/index';
import clsx from 'clsx';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updatePortValue } from '../../store/slices/flowSlice';
import { getTypeBackgroundColor } from '../../utils/colors';

interface NodePortProps {
    property: PropertyInfo;
    type: 'input' | 'output';
    nodeId: string;
    onConnectionStart?: (nodeId: string, portId: string, type: PropertyType) => void;
    onConnectionEnd?: (nodeId: string, portId: string, type: PropertyType) => void;
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

    const handleConnectionEvent = (_e: React.PointerEvent<HTMLButtonElement>) => {
        if (type === 'output') {
            onConnectionStart?.(nodeId, property.id, property.type);
        } else {
            onConnectionEnd?.(nodeId, property.id, property.type);
        }
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = property.type === 'number' ? Number(e.target.value) : e.target.value;
        dispatch(updatePortValue({ nodeId, portId: property.id, value }));
    };

    // 渲染连接按钮
    const renderConnectionButton = (isInput: boolean) => (
        <button
            ref={buttonRef}
            type='button'
            className={clsx('rounded-full w-4 h-4 transition-colors', getTypeBackgroundColor(property.type))}
            onPointerUp={isInput ? handleConnectionEvent : undefined}
            onPointerDown={handleConnectionEvent}
            onPointerEnter={isInput ? () => setIsHovering(true) : undefined}
            onPointerLeave={isInput ? () => setIsHovering(false) : undefined}
            data-hovering={isInput ? isHovering : undefined}
            aria-label={`Connect ${property.type}`}
            data-node-id={nodeId}
            data-property-id={property.id}
            data-property-type={property.type}
        />
    );

    // 渲染输入框
    const renderInputField = () => {
        if (isConnected) return null;

        if (property.type === 'string') {
            return (
                <input
                    type="text"
                    className="input input-bordered flex-1"
                    placeholder={property.name}
                    value={portValue}
                    onChange={handleValueChange}
                />
            );
        }

        if (property.type === 'number') {
            return (
                <input
                    type="number"
                    className="input input-bordered flex-1"
                    placeholder={property.name}
                    value={portValue}
                    onChange={handleValueChange}
                />
            );
        }

        return null;
    };

    return (
        <div className={clsx(["flex items-center gap-2"], {
            "justify-end": type === 'output',
            "justify-start": type === 'input',
        })}>
            {type === 'input' && (
                <>
                    {renderConnectionButton(true)}
                    <span>{property.name}</span>
                    {renderInputField()}
                </>
            )}
            {type === 'output' && (
                <>
                    <span>{property.name}</span>
                    {renderConnectionButton(false)}
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
    onConnectionStart?: (nodeId: string, portId: string, type: PropertyType) => void;
    onConnectionEnd?: (nodeId: string, portId: string, type: PropertyType) => void;
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