import React, { useRef, useCallback, useEffect } from 'react';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (html: string) => void;
  minHeight?: string;
}

export default function RichTextEditor({ label, value, onChange, minHeight = '200px' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const lastExternalValue = useRef(value);

  // Initialize editor content once on mount, and update only when value changes externally
  useEffect(() => {
    if (!editorRef.current) return;

    if (!initializedRef.current) {
      // First mount: set initial content
      editorRef.current.innerHTML = value || '';
      initializedRef.current = true;
      lastExternalValue.current = value;
      return;
    }

    // Only overwrite editor if the value changed from outside (not from user input)
    if (value !== lastExternalValue.current) {
      const currentHtml = editorRef.current.innerHTML;
      if (currentHtml !== value) {
        editorRef.current.innerHTML = value || '';
      }
      lastExternalValue.current = value;
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastExternalValue.current = html;
      onChange(html);
    }
  }, [onChange]);

  function execCmd(command: string, val?: string) {
    // Focus is preserved because ToolBtn uses onMouseDown preventDefault
    // Execute the command on the current selection
    document.execCommand(command, false, val);
    // Sync changes back to React state
    handleInput();
  }

  function insertLink() {
    // Save selection before prompt (prompt causes blur)
    const selection = window.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;

    const url = prompt('Ingresa la URL del enlace:');
    if (url) {
      // Restore selection after prompt
      editorRef.current?.focus();
      if (range) {
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      document.execCommand('createLink', false, url);
      handleInput();
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{label}</label>

      {/* Toolbar */}
      <div style={{
        display: 'flex', gap: '2px', flexWrap: 'wrap', padding: '6px 8px',
        background: '#f8fafc', border: '1.5px solid #e2e8f0', borderBottom: 'none',
        borderRadius: '6px 6px 0 0',
      }}>
        <ToolBtn icon="fas fa-bold" title="Negrita" onClick={() => execCmd('bold')} />
        <ToolBtn icon="fas fa-italic" title="Cursiva" onClick={() => execCmd('italic')} />
        <ToolBtn icon="fas fa-underline" title="Subrayado" onClick={() => execCmd('underline')} />
        <Separator />
        <ToolBtn icon="fas fa-heading" title="Titulo H2" onClick={() => execCmd('formatBlock', 'H2')} text="H2" />
        <ToolBtn icon="fas fa-heading" title="Subtitulo H3" onClick={() => execCmd('formatBlock', 'H3')} text="H3" />
        <ToolBtn icon="fas fa-paragraph" title="Parrafo" onClick={() => execCmd('formatBlock', 'P')} />
        <Separator />
        <ToolBtn icon="fas fa-list-ul" title="Lista" onClick={() => execCmd('insertUnorderedList')} />
        <ToolBtn icon="fas fa-list-ol" title="Lista numerada" onClick={() => execCmd('insertOrderedList')} />
        <Separator />
        <ToolBtn icon="fas fa-link" title="Enlace" onClick={insertLink} />
        <ToolBtn icon="fas fa-quote-right" title="Cita" onClick={() => execCmd('formatBlock', 'BLOCKQUOTE')} />
        <Separator />
        <ToolBtn icon="fas fa-align-left" title="Alinear izquierda" onClick={() => execCmd('justifyLeft')} />
        <ToolBtn icon="fas fa-align-center" title="Centrar" onClick={() => execCmd('justifyCenter')} />
        <ToolBtn icon="fas fa-align-right" title="Alinear derecha" onClick={() => execCmd('justifyRight')} />
        <Separator />
        <ToolBtn icon="fas fa-eraser" title="Limpiar formato" onClick={() => execCmd('removeFormat')} />
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        style={{
          padding: '0.75rem',
          border: '1.5px solid #e2e8f0',
          borderTop: '1px solid #e2e8f0',
          borderRadius: '0 0 6px 6px',
          minHeight,
          fontSize: '0.9rem',
          lineHeight: '1.7',
          color: '#334155',
          outline: 'none',
          overflow: 'auto',
          background: 'white',
        }}
      />

      <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.2rem' }}>
        Usa la barra de herramientas para dar formato. El contenido se mostrara tal como aparece aqui en la pagina publica.
      </p>
    </div>
  );
}

function ToolBtn({ icon, title, onClick, text }: { icon: string; title: string; onClick: () => void; text?: string }) {
  return (
    <button
      type="button"
      onMouseDown={(e: React.MouseEvent) => {
        // CRITICAL: Prevent mousedown from stealing focus/selection from the contentEditable editor.
        // Without this, clicking a toolbar button moves focus away from the editor,
        // which causes document.execCommand to have no selection to operate on,
        // resulting in text being erased or commands having no effect.
        e.preventDefault();
      }}
      onClick={onClick}
      title={title}
      style={{
        background: 'none', border: '1px solid transparent', borderRadius: '4px',
        cursor: 'pointer', padding: '4px 7px', fontSize: '0.8rem', color: '#475569',
        display: 'flex', alignItems: 'center', gap: '3px',
        transition: 'all 0.15s',
      }}
      onMouseOver={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
      onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'transparent'; }}
    >
      {text ? <span style={{ fontWeight: 700, fontSize: '0.7rem' }}>{text}</span> : <i className={icon} />}
    </button>
  );
}

function Separator() {
  return <div style={{ width: '1px', height: '20px', background: '#e2e8f0', margin: '0 4px', alignSelf: 'center' }} />;
}
