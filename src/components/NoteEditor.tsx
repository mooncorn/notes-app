import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { StyledInput } from "./StyledInput";

interface NoteEditorProps {
  title: string;
  code: string;
  isEditing: boolean;
  setTitle: (title: string) => void;
  setCode: (code: string) => void;
  onSave: (node: {
    title: string;
    content: string;
    isEditing: boolean;
  }) => void;
  onCancel: () => void;
}

export const NoteEditor = ({
  title,
  code,
  isEditing,
  setTitle,
  setCode,
  onSave,
  onCancel,
}: NoteEditorProps) => {
  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <h2 className="card-title">
          <StyledInput
            type="text"
            placeholder="Note title"
            value={title}
            setValue={setTitle}
            onChange={(text) => setTitle(text)}
          />
        </h2>
        <CodeMirror
          value={code}
          theme={vscodeDark}
          width="100%"
          height="300px"
          extensions={[
            markdown({ base: markdownLanguage, codeLanguages: languages }),
          ]}
          onChange={(value) => setCode(value)}
          className="mt-2"
        />
        <div className="card-actions justify-end">
          <button
            className="btn btn-primary"
            disabled={title.trim().length === 0 || code.trim().length === 0}
            onClick={() => {
              onSave({ title, content: code, isEditing });
              setCode("");
              setTitle("");
            }}
          >
            Save
          </button>
          {isEditing && (
            <button
              className="btn btn-warning"
              onClick={() => {
                onCancel();
                setCode("");
                setTitle("");
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
