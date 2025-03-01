export const EDITOR_CONFIG = {
    grid: {
        size: 48,           // 网格大小
        color: 'rgba(128, 128, 128, 0.2)',  // 网格线颜色
    },
    node: {
        defaultWidth: 192,  // 48 * 4 = 192px (w-48 in Tailwind)
        defaultHeight: 192, // 默认高度与宽度相同
        minWidth: 192,     // 最小宽度
        minHeight: 192,    // 最小高度
        minDistance: 50,   // 节点之间的最小距离
    },
    shortcuts: {
        undo: '⌘Z',       // Mac 显示
        redo: '⌘⇧Z',     // Mac 显示
        undoWin: 'Ctrl+Z',  // Windows 显示
        redoWin: 'Ctrl+Shift+Z', // Windows 显示
    }
} as const; 