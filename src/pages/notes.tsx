import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Header } from "~/components/Header";
import { NoteCard } from "~/components/NoteCard";
import { NoteEditor } from "~/components/NoteEditor";
import { api, RouterOutputs } from "~/utils/api";

type Topic = RouterOutputs["topic"]["getAll"][0];
type Note = RouterOutputs["note"]["getAll"][0];

export default function Home() {
  const { data: sessionData } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!sessionData?.user) router.push("/");
  });

  return (
    <>
      <Head>
        <title>Notes</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Header />
        <Content />
      </main>
    </>
  );
}

const Content = () => {
  const [topicTitle, setTopicTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTopics, setSearchTopics] = useState<Topic[] | undefined>(
    undefined
  );
  const [isTopicTitleInvalid, setIsTopicTitleInvalid] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const { data: sessionData } = useSession();

  const { data: topics, refetch: refetchTopics } = api.topic.getAll.useQuery(
    undefined,
    {
      enabled: sessionData?.user !== undefined,
      onSuccess: (data) => setSearchTopics(data),
    }
  );

  const { data: notes, refetch: refetchNotes } = api.note.getAll.useQuery(
    {
      topicId: selectedTopic?.id ?? "",
    },
    {
      enabled: sessionData?.user !== undefined && selectedTopic !== null,
    }
  );

  const createTopicMutation = api.topic.create.useMutation({
    onSuccess: (topic) => {
      refetchTopics();
      setSelectedTopic(topic);
    },
  });

  const createNoteMutation = api.note.create.useMutation({
    onSuccess: () => refetchNotes(),
  });

  const deleteNoteMutation = api.note.delete.useMutation({
    onSuccess: () => refetchNotes(),
  });

  const updateNoteMutation = api.note.update.useMutation({
    onSuccess: () => refetchNotes(),
  });

  const createTopic = () => {
    if (topicTitle.length === 0) {
      setIsTopicTitleInvalid(true);
      return;
    }

    createTopicMutation.mutate({ title: topicTitle });
    setTopicTitle("");
  };

  const renderTopics = () => {
    return searchTopics?.map((topic) => (
      <li key={topic.id} className="">
        <a
          href="#"
          className={`block max-w-full truncate ${
            topic.id == selectedTopic?.id ? "active" : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            setSelectedTopic(topic);
            setSelectedNote(null);
            setNoteContent("");
            setNoteTitle("");
          }}
        >
          {topic.title}
        </a>
      </li>
    ));
  };

  const renderNotes = () => {
    return notes?.map((note) => (
      <div key={note.id} className="mt-5">
        <NoteCard
          note={note}
          onDelete={() => deleteNoteMutation.mutate({ id: note.id })}
          onEdit={() => {
            setNoteContent(note.content);
            setNoteTitle(note.title);
            setSelectedNote(note);
          }}
        />
      </div>
    ));
  };

  return (
    <>
      <div className="mx-5 mt-5 grid gap-5 md:grid-cols-4">
        <div className="px-2">
          <input
            type="text"
            placeholder="Create topic"
            className={`input input-bordered input-sm w-full ${
              isTopicTitleInvalid && "input-error"
            }`}
            value={topicTitle}
            onChange={(e) => {
              setTopicTitle(e.target.value);
              setIsTopicTitleInvalid(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") createTopic();
            }}
          />

          {isTopicTitleInvalid && (
            <label className="label label-text-alt text-error">
              Topic title cannot be empty
            </label>
          )}
          <div className="divider"></div>

          <input
            type="text"
            placeholder="Search"
            className="input input-bordered input-sm w-full"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSearchTopics(
                topics?.filter((topic) =>
                  topic.title
                    .toLowerCase()
                    .includes(e.target.value.toLowerCase())
                )
              );
            }}
          />

          {searchTerm && (
            <label className="label label-text-alt flex-row-reverse">
              <a
                href="#"
                className="link"
                onClick={() => {
                  setSearchTopics(topics);
                  setSearchTerm("");
                }}
              >
                Clear
              </a>
            </label>
          )}

          <div className="divider"></div>

          <div className="menu-title">
            <div className="flex gap-2">
              <span className="flex-1">Topics</span>
              <span className="flex-none">{searchTopics?.length}</span>
            </div>
          </div>

          <ul className="menu rounded-box h-40 flex-nowrap overflow-auto bg-base-100 px-0 md:h-96">
            {renderTopics()}
          </ul>
          <div className="divider"></div>
        </div>
        <div className="md:col-span-3">
          {selectedTopic && (
            <>
              <NoteEditor
                title={noteTitle}
                code={noteContent}
                setTitle={setNoteTitle}
                setCode={setNoteContent}
                isEditing={selectedNote ? true : false}
                onSave={({ title, content, isEditing }) => {
                  if (isEditing) {
                    updateNoteMutation.mutate({
                      id: selectedNote!.id,
                      title,
                      content,
                    });
                  } else {
                    createNoteMutation.mutate({
                      title,
                      content,
                      topicId: selectedTopic.id,
                    });
                  }
                }}
                onCancel={() => setSelectedNote(null)}
              />
              {renderNotes()}
            </>
          )}
        </div>
      </div>
    </>
  );
};
