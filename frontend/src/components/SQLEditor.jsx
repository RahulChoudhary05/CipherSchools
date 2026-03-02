import { lazy, Suspense, useRef } from 'react'
import './SQLEditor.scss'

const MonacoEditor = lazy(() => import('@monaco-editor/react'))

function SQLEditor({ value, onChange, onRun }) {
  const editorRef = useRef(null)

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor

    // Ctrl+Enter to run query
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      () => { if (onRun) onRun() }
    )

    // Focus the editor on mount
    editor.focus()
  }

  return (
    <div className="sql-editor">
      <Suspense fallback={
        <div className="sql-editor__loading">
          <span className="spinner" />
          <span>Loading editor...</span>
        </div>
      }>
        <MonacoEditor
          height="100%"
          language="sql"
          value={value}
          onChange={onChange}
          theme="vs-dark"
          onMount={(editor, monaco) => handleEditorMount(editor, monaco)}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', monospace",
            fontLigatures: true,
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            padding: { top: 12, bottom: 12 },
            lineDecorationsWidth: 8,
            renderLineHighlight: 'line',
            selectionHighlight: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false
            },
            folding: false,
            bracketPairColorization: { enabled: true },
            guides: { indentation: false },
            glyphMargin: false,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              useShadows: false,
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            }
          }}
        />
      </Suspense>
    </div>
  )
}

export default SQLEditor
