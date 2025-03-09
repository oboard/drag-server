import { BaseNodeComponent, BaseNodeComponentProps } from './BaseNode';
import { useDispatch } from 'react-redux';
import { updateNodeContent } from '../../store';
import { useState, useEffect, useRef } from 'react';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { ViewUpdate } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
import { closeBrackets } from '@codemirror/autocomplete';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export function JsonNodeComponent(props: BaseNodeComponentProps) {
    const dispatch = useDispatch();
    const editorRef = useRef<HTMLDivElement>(null);
    const [editorView, setEditorView] = useState<EditorView | null>(null);
    const [isValidJson, setIsValidJson] = useState(true);
    const [jsonSize, setJsonSize] = useState({ keys: 0, size: 0 });
    const [isDarkMode, setIsDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

    // 添加事件处理函数来阻止删除快捷键
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.stopPropagation();
        }
    };

    // 监听系统颜色模式变化
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setIsDarkMode(e.matches);
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    // 当暗黑模式状态变化时更新编辑器主题
    useEffect(() => {
        if (editorView) {
            // 重新创建编辑器状态以应用新主题
            const newState = EditorState.create({
                doc: editorView.state.doc,
                extensions: [
                    history(),
                    syntaxHighlighting(defaultHighlightStyle),
                    bracketMatching(),
                    closeBrackets(),
                    keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
                    json(),
                    isDarkMode ? githubDark : githubLight,
                    EditorView.theme({
                        "&": { height: "100%", width: "100%" },
                        ".cm-editor": { height: "100%", width: "100%" },
                        ".cm-scroller": { height: "100%", overflow: "auto" },
                        ".cm-content": { height: "100%", minHeight: "100px" }
                    }),
                    EditorState.tabSize.of(2),
                    EditorView.lineWrapping,
                    EditorView.updateListener.of((update: ViewUpdate) => {
                        if (update.docChanged) {
                            const newContent = update.state.doc.toString();
                            dispatch(updateNodeContent({ id: props.node.id, content: newContent }));

                            try {
                                const parsed = JSON.parse(newContent);
                                setIsValidJson(true);
                                setJsonSize({
                                    keys: countKeys(parsed),
                                    size: new TextEncoder().encode(newContent).length
                                });
                            } catch (e) {
                                setIsValidJson(false);
                            }
                        }
                    })
                ]
            });
            
            editorView.setState(newState);
        }
    }, [isDarkMode, editorView, dispatch, props.node.id]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (!editorRef.current) return;

        // 添加键盘事件监听
        const editorElement = editorRef.current;
        editorElement.addEventListener('keydown', handleKeyDown, true);

        if (editorView) {
            const currentContent = editorView.state.doc.toString();
            if (currentContent !== props.node.content && props.node.content !== undefined) {
                editorView.dispatch({
                    changes: { from: 0, to: currentContent.length, insert: props.node.content }
                });
            }
            return;
        }

        const theme = EditorView.theme({
            "&": { height: "100%", width: "100%" },
            ".cm-editor": { height: "100%", width: "100%" },
            ".cm-scroller": { height: "100%", overflow: "auto" },
            ".cm-content": { height: "100%", minHeight: "100px" }
        });

        const startState = EditorState.create({
            doc: props.node.content || '{\n  \n}',
            extensions: [
                history(),
                syntaxHighlighting(defaultHighlightStyle),
                bracketMatching(),
                closeBrackets(),
                keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
                json(),
                isDarkMode ? githubDark : githubLight,
                theme,
                EditorState.tabSize.of(2),
                EditorView.lineWrapping,
                EditorView.updateListener.of((update: ViewUpdate) => {
                    if (update.docChanged) {
                        const newContent = update.state.doc.toString();
                        dispatch(updateNodeContent({ id: props.node.id, content: newContent }));

                        try {
                            const parsed = JSON.parse(newContent);
                            setIsValidJson(true);
                            setJsonSize({
                                keys: countKeys(parsed),
                                size: new TextEncoder().encode(newContent).length
                            });
                        } catch (e) {
                            setIsValidJson(false);
                        }
                    }
                })
            ]
        });

        const view = new EditorView({ state: startState, parent: editorRef.current });
        setEditorView(view);

        try {
            const parsed = JSON.parse(props.node.content || '{}');
            setIsValidJson(true);
            setJsonSize({
                keys: countKeys(parsed),
                size: new TextEncoder().encode(props.node.content || '{}').length
            });
        } catch (e) {
            setIsValidJson(false);
        }

        return () => {
            view.destroy();
            editorElement.removeEventListener('keydown', handleKeyDown, true);
        };
    }, []);

    const countKeys = (obj: JsonValue): number => {
        if (typeof obj !== 'object' || obj === null) return 0;
        let count = 0;
        if (Array.isArray(obj)) {
            for (const item of obj) count += countKeys(item);
        } else {
            count = Object.keys(obj).length;
            for (const key of Object.keys(obj)) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    count += countKeys(obj[key]);
                }
            }
        }
        return count;
    };

    return (
        <BaseNodeComponent resizable={true} {...props}>
            <div className='w-full h-full p-2 flex flex-col'>
                <div ref={editorRef} className="w-full h-full overflow-hidden rounded-lg border border-base-300" />
                <div className="flex justify-between text-sm text-base-content/50 mt-1">
                    <div className={isValidJson ? "text-success" : "text-error"}>
                        {isValidJson ? "有效的 JSON" : "无效的 JSON"}
                    </div>
                    <div>
                        键: {jsonSize.keys} | 大小: {(jsonSize.size / 1024).toFixed(2)} KB
                    </div>
                </div>
            </div>
        </BaseNodeComponent>
    );
}