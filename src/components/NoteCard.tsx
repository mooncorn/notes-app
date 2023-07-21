import { RouterOutputs } from "~/utils/api";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { BsFillTrashFill } from "react-icons/bs";
import { BiEditAlt } from "react-icons/bi";

type Note = RouterOutputs["note"]["getAll"][0];

export const NoteCard = ({
  note,
  onDelete,
  onEdit,
}: {
  note: Note;
  onDelete: () => void;
  onEdit: () => void;
}) => {
  return (
    <div className="collapse bg-base-200">
      <input type="checkbox" />
      <div className="collapse-title flex justify-between font-medium">
        <h3 className="text-xl">{note.title}</h3>
        <div className="z-10 mt-1 flex justify-end gap-2">
          <BiEditAlt
            size={18}
            onMouseOver={(e) => e.currentTarget.classList.add("text-success")}
            onMouseLeave={(e) =>
              e.currentTarget.classList.remove("text-success")
            }
            onClick={() => onEdit()}
          />
          <BsFillTrashFill
            size={18}
            onMouseOver={(e) => e.currentTarget.classList.add("text-error")}
            onMouseLeave={(e) => e.currentTarget.classList.remove("text-error")}
            onClick={() => onDelete()}
          />
        </div>
      </div>

      <div className="collapse-content">
        <article className="prose lg:prose-xl">
          <ReactMarkdown>{note.content}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
};
