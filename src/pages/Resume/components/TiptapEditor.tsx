import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@heroui/react";
import { Bold, Italic, List, ListOrdered, Undo, Redo } from "lucide-react";

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert focus:outline-none min-h-[150px] px-3 py-2",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-default-200 rounded-lg overflow-hidden bg-content1">
      <div className="flex items-center gap-1 p-2 border-b border-default-200 bg-default-50">
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("bold") ? "solid" : "light"}
          onPress={() => editor.chain().focus().toggleBold().run()}
          aria-label="加粗"
        >
          <Bold size={16} />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("italic") ? "solid" : "light"}
          onPress={() => editor.chain().focus().toggleItalic().run()}
          aria-label="斜体"
        >
          <Italic size={16} />
        </Button>
        <div className="w-[1px] h-4 bg-default-300 mx-1" />
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("bulletList") ? "solid" : "light"}
          onPress={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="无序列表"
        >
          <List size={16} />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant={editor.isActive("orderedList") ? "solid" : "light"}
          onPress={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="有序列表"
        >
          <ListOrdered size={16} />
        </Button>
        <div className="w-[1px] h-4 bg-default-300 mx-1" />
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => editor.chain().focus().undo().run()}
          isDisabled={!editor.can().undo()}
          aria-label="撤销"
        >
          <Undo size={16} />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={() => editor.chain().focus().redo().run()}
          isDisabled={!editor.can().redo()}
          aria-label="重做"
        >
          <Redo size={16} />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
