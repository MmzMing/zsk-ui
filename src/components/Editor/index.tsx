import React, { useState } from "react";
import { EditorState } from "draft-js";
import DraftEditor from "@draft-js-plugins/editor";

type Props = {
  readOnly?: boolean;
};

function RichEditor(props: Props) {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  return (
    <div className="border border-[var(--border-color)] rounded-[var(--radius-base)] bg-[var(--bg-elevated)] p-3">
      <div className="text-xs mb-2 text-[var(--text-color-secondary)]">
        编辑器占位：后续将根据文档要求支持富文本 / Markdown 双模式、版本历史、自动保存等功能。
      </div>
      <div className="min-h-[160px] text-sm">
        <DraftEditor
          editorState={editorState}
          onChange={setEditorState}
          readOnly={props.readOnly}
        />
      </div>
    </div>
  );
}

export default RichEditor;

