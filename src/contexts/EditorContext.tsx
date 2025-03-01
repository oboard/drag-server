import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionCreators } from 'redux-undo';
import toast from 'react-hot-toast';
import { RootState } from '../store';

interface EditorContextType {
    undo: () => void;
    redo: () => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch();
    const canUndo = useSelector((state: RootState) => state.flow.past.length > 0);
    const canRedo = useSelector((state: RootState) => state.flow.future.length > 0);

    const undo = useCallback(() => {
        if (!canUndo) {
            toast('已经是第一步操作了', {
                icon: '⚠️',
            });
            return;
        }
        dispatch(ActionCreators.undo());
        toast('撤销操作', {
            icon: '⏪',
        });
    }, [dispatch, canUndo]);

    const redo = useCallback(() => {
        if (!canRedo) {
            toast('已经是最后一步操作了', {
                icon: '⚠️',
            });
            return;
        }
        dispatch(ActionCreators.redo());
        toast('重做操作', {
            icon: '⏩',
        });
    }, [dispatch, canRedo]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 检查是否按下 Ctrl 键（Windows）或 Command 键（Mac）
            const isCtrlOrCmd = e.metaKey || e.ctrlKey;

            if (isCtrlOrCmd && e.shiftKey && e.key.toLowerCase() === 'z') {
                // Ctrl/Cmd + Shift + Z = 重做
                e.preventDefault();
                redo();
            } else if (isCtrlOrCmd && e.key.toLowerCase() === 'z') {
                // Ctrl/Cmd + Z = 撤销
                e.preventDefault();
                undo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    return (
        <EditorContext.Provider value={{ undo, redo }}>
            {children}
        </EditorContext.Provider>
    );
}

export function useEditor() {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error('useEditor must be used within an EditorProvider');
    }
    return context;
} 