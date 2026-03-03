export const EDITOR_THEME = 'codehelix-dark';

export function defineHelixTheme() {
    if (typeof monaco === 'undefined') return;

    monaco.editor.defineTheme(EDITOR_THEME, {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
            { token: 'keyword', foreground: '00ffa3' },
            { token: 'string', foreground: 'f1fa8c' },
            { token: 'number', foreground: 'bd93f9' },
            { token: 'type', foreground: '22d3ee' },
            { token: 'function', foreground: 'a855f7' },
        ],
        colors: {
            'editor.background': '#030305',
            'editor.lineHighlightBackground': '#111115',
            'editorLineNumber.foreground': '#4b5563',
            'editor.selectionBackground': '#22d3ee33',
            'editorIndentGuide.background': '#1f2937',
            'editorIndentGuide.activeBackground': '#00ffa366',
            'editor.border': '#1f2937'
        }
    });
}

export const COMMON_EDITOR_CONFIG = {
    theme: EDITOR_THEME,
    automaticLayout: true,
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Geist Mono', 'Fira Code', monospace",
    lineHeight: 22,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    padding: { top: 20 },
    smoothScrolling: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    bracketPairColorization: { enabled: true },
    formatOnPaste: true,
    spellcheck: false,
    renderValidationDecorations: 'off', // Disables false-positive red squiggles for unsupported languages
};
