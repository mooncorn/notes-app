import { useRef } from "react";
import { BsFillTrashFill } from "react-icons/bs";
import { BiEditAlt } from "react-icons/bi";
import { Note } from "~/server/api/routers/note";
import ReactMarkdown from "react-markdown";

interface NoteCardProps {
  note: Note;
  onDelete: () => void;
  onEdit: () => void;
}

export const NoteCard = ({ note, onDelete, onEdit }: NoteCardProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="collapse bg-base-100 shadow-lg">
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
            onClick={() => dialogRef.current!.showModal()}
          />

          <dialog ref={dialogRef} className="modal">
            <form method="dialog" className="modal-box">
              <h3 className="text-lg font-bold">Delete note</h3>
              <p className="py-4">Are you sure you want to delete this note?</p>
              <div className="modal-action">
                <button className="btn btn-error" onClick={() => onDelete()}>
                  Yes
                </button>
                {/* <!-- if there is a button in form, it will close the modal --> */}
                <button className="btn">No</button>
              </div>
            </form>
          </dialog>
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
