import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

export const NoteEditor = ({
  onSave,
}: {
  onSave: (node: { title: string; content: string }) => void;
}) => {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">
          <input
            type="text"
            placeholder="Note title"
            className="input input-primary input-lg w-full font-bold"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </h2>
        <CodeMirror
          value={code}
          theme={vscodeDark}
          width="100%"
          height="30vh"
          extensions={[
            markdown({ base: markdownLanguage, codeLanguages: languages }),
          ]}
          onChange={(value) => setCode(value)}
          className=""
        />
        <div className="card-actions justify-end">
          <button
            className="btn btn-primary"
            disabled={title.trim().length === 0 || code.trim().length === 0}
            onClick={() => {
              onSave({ title, content: code });
              setCode("");
              setTitle("");
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
