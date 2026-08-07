import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;
  const btnStyle = (isActive: boolean) => ({
    padding: '4px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.8rem',
    background: isActive ? '#E5E7EB' : 'transparent', color: '#374151',
  });
  return (
    <div style={{ display: 'flex', gap: '4px', padding: '6px 8px', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', flexWrap: 'wrap' }}>
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={{ ...btnStyle(editor.isActive('bold')), fontWeight: 'bold' }}>B</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={{ ...btnStyle(editor.isActive('italic')), fontStyle: 'italic' }}>I</button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} style={{ ...btnStyle(editor.isActive('strike')), textDecoration: 'line-through' }}>S</button>
      <div style={{ width: '1px', backgroundColor: '#D1D5DB', margin: '0 4px' }} />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={btnStyle(editor.isActive('bulletList'))}>• List</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} style={btnStyle(editor.isActive('orderedList'))}>1. List</button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} style={{ ...btnStyle(editor.isActive('codeBlock')), fontFamily: 'monospace' }}>&lt;/&gt;</button>
    </div>
  );
};

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, onBlur, placeholder = 'Add details...', minHeight = '120px' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onBlur: () => {
      if (onBlur) onBlur();
    }
  });

  // Keep editor content in sync if value prop changes externally
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <>
      <style>{`
        .ProseMirror {
          outline: none !important;
          min-height: ${minHeight};
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #9CA3AF;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
      <div style={{ border: '1px solid #D1D5DB', borderRadius: '6px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
        <MenuBar editor={editor} />
        <EditorContent 
          editor={editor} 
          style={{ padding: '12px', minHeight, backgroundColor: '#FFFFFF', fontSize: '0.875rem' }} 
          className="prose prose-sm max-w-none focus:outline-none" 
        />
      </div>
    </>
  );
};
