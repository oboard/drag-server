import React, { createContext, useContext, useState, useCallback } from 'react';

interface ConnectionContextType {
    registerPort: (portId: string, element: HTMLElement) => void;
    unregisterPort: (portId: string) => void;
    getPortElement: (portId: string) => HTMLElement | null;
    setHoveredInputPort: (portId: string | null) => void;
    hoveredInputPort: string | null;
}

const ConnectionContext = createContext<ConnectionContextType | null>(null);

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
    const [ports, setPorts] = useState<Map<string, HTMLElement>>(new Map());
    const [hoveredInputPort, setHoveredInputPort] = useState<string | null>(null);

    const registerPort = useCallback((portId: string, element: HTMLElement) => {
        setPorts(prev => {
            const next = new Map(prev);
            next.set(portId, element);
            return next;
        });
    }, []);

    const unregisterPort = useCallback((portId: string) => {
        setPorts(prev => {
            const next = new Map(prev);
            next.delete(portId);
            return next;
        });
    }, []);

    const getPortElement = useCallback((portId: string) => {
        return ports.get(portId) || null;
    }, [ports]);

    return (
        <ConnectionContext.Provider value={{
            registerPort,
            unregisterPort,
            getPortElement,
            setHoveredInputPort,
            hoveredInputPort
        }}>
            {children}
        </ConnectionContext.Provider>
    );
}

export function useConnection() {
    const context = useContext(ConnectionContext);
    if (!context) {
        throw new Error('useConnection must be used within a ConnectionProvider');
    }
    return context;
} 