import { useSelector } from 'react-redux';
import { RootState } from '../store';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DefaultCodeGenerator } from '../codegen/DefaultCodeGenerator';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
import { defaultKeymap } from '@codemirror/commands';
import { closeBrackets } from '@codemirror/autocomplete';

interface CodePreviewProps {
    isOpen: boolean;
    onClose: () => void;
}

const editorTheme = EditorView.theme({
    "&": { height: "100%" },
    ".cm-editor": { height: "100%" },
    ".cm-scroller": { 
        overflow: "auto",
        height: "100%"
    },
    "&.cm-focused": { outline: "none" }
});

export function CodePreview({ isOpen, onClose }: CodePreviewProps) {
    const { nodes, connections, properties } = useSelector((state: RootState) => state.flow.present);
    const [error, setError] = useState<string | null>(null);
    const [generatedCode, setGeneratedCode] = useState('');
    const codeGenerator = React.useMemo(() => new DefaultCodeGenerator(), []);
    const editorRef = useRef<HTMLDivElement>(null);
    const [editorView, setEditorView] = useState<EditorView | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

    useEffect(() => {
        if (!isOpen && editorView) {
            editorView.destroy();
            setEditorView(null);
        }
    }, [isOpen, editorView]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    const createEditorState = useCallback((content: string) => EditorState.create({
        doc: content,
        extensions: [
            syntaxHighlighting(defaultHighlightStyle),
            bracketMatching(),
            closeBrackets(),
            keymap.of(defaultKeymap),
            javascript(),
            isDarkMode ? githubDark : githubLight,
            editorTheme,
            EditorState.tabSize.of(2),
            EditorView.lineWrapping,
            EditorView.editable.of(false)
        ]
    }), [isDarkMode]);

    useEffect(() => {
        if (!editorRef.current || !isOpen || !generatedCode) return;

        if (!editorView) {
            const view = new EditorView({ parent: editorRef.current });
            view.setState(createEditorState(generatedCode));
            setEditorView(view);
        } else {
            editorView.setState(createEditorState(generatedCode));
        }
    }, [isOpen, generatedCode, editorView, createEditorState]);

    useEffect(() => {
        if (!isOpen) return;

        try {
            const code = codeGenerator.generate({ nodes, connections, properties });
            setGeneratedCode(code);
            setError(null);
        } catch (err) {
            setGeneratedCode('// 代码生成失败，请查看控制台获取详细错误信息');
            setError(err instanceof Error ? err.message : String(err));
        }
    }, [isOpen, nodes, connections, properties, codeGenerator]);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(generatedCode)
            .then(() => alert('代码已复制到剪贴板'))
            .catch(() => alert('复制失败'));
    };

    if (!isOpen) return null;

    return (
        <dialog open className="modal modal-open">
            <div className="modal-box max-w-4xl h-[80vh] flex flex-col p-0">
                <div className="p-4 border-b">
                    <h3 className="font-bold text-lg">代码预览</h3>
                </div>
                
                <div className="flex-1 overflow-hidden">
                    {error && (
                        <div className="p-4 text-error">{error}</div>
                    )}
                    <div ref={editorRef} className="h-full" />
                </div>

                <div className="p-4 border-t flex justify-end gap-2">
                    <button type="button" className="btn btn-primary btn-sm" onClick={handleCopyCode}>
                        复制代码
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
                        关闭
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="button" onClick={onClose}>关闭</button>
            </form>
        </dialog>
    );
}