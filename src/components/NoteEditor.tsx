import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { RouterOutputs } from "~/utils/api";

type Note = RouterOutputs["note"]["getAll"][0];

export const NoteEditor = ({
  onSave,
  onCancel,
  // note,
  title,
  setTitle,
  code,
  setCode,
  isEditing,
}: {
  onSave: (node: {
    title: string;
    content: string;
    isEditing: boolean;
  }) => void;
  onCancel: () => void;
  // note: Note | null;
  title: string;
  setTitle: (title: string) => void;
  code: string;
  setCode: (code: string) => void;
  isEditing: boolean;
}) => {
  return (
    <div className="card bg-base-200 shadow-md">
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
