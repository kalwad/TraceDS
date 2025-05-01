import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import './index.css';

export default function CodeEditor({ code, onChange, onRun, highlightLine, errorInfo, dark }) {
  const editorRef     = useRef(null);
  const decorationIds = useRef([]);

  const handleMount = ed => { editorRef.current = ed; };

  // switch themes
  useEffect(() => {
    monaco.editor.setTheme(dark ? 'vs-dark' : 'vs-light');
  }, [dark]);

  // decorations
  useEffect(() => {
    if (!editorRef.current) return;
    const ed = editorRef.current;
    const decos = [];

    if (highlightLine) {
      decos.push({
        range: new monaco.Range(highlightLine, 1, highlightLine, 1),
        options: {
          isWholeLine: true,
          className: 'exec-line-highlight',
          glyphMarginClassName: 'exec-glyph'
        }
      });
    }
    if (errorInfo?.line) {
      decos.push({
        range: new monaco.Range(errorInfo.line, 1, errorInfo.line, 1),
        options: {
          isWholeLine: true,
          className: 'error-line-highlight',
          glyphMarginClassName: 'error-glyph'
        }
      });
    }
    decorationIds.current = ed.deltaDecorations(decorationIds.current, decos);
  }, [highlightLine, errorInfo]);

  return (
    <div className="editor-wrapper">
      <div className="editor-container">
        <Editor
          height="100%"
          language="python"
          value={code}
          onChange={v => onChange(v || '')}
          onMount={handleMount}
          theme={dark ? 'vs-dark' : 'vs-light'}  
          options={{
            fontSize: 14,
            fontFamily: 'Courier New, monospace',
            lineNumbers: 'on',
            lineNumbersMinChars: 5,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 8, bottom: 8 },
            glyphMargin: true,
            renderLineHighlight: 'gutter'
          }}
        />
      </div>
      <button className="run-button" onClick={onRun}>Run</button>
    </div>
  );
}
