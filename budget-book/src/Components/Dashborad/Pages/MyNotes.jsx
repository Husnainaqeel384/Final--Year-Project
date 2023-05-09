import { useState } from "react";

function MyNotes() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (newNote.trim() === "") return;
    setNotes([...notes, newNote.trim()]);
    setNewNote("");
  };

  const handleDeleteNote = (index) => {
    const newNotes = [...notes];
    newNotes.splice(index, 1);
    setNotes(newNotes);
  };

  const handleEditNote = (index, newText) => {
    const newNotes = [...notes];
    newNotes[index] = newText.trim();
    setNotes(newNotes);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">My Notes</h1>
      <div className="flex mb-4">
        <input
          className="border rounded px-4 py-2 mr-2"
          type="text"
          placeholder="Add a note"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleAddNote}
        >
          Add
        </button>
      </div>
      <ul className="list-disc">
        {notes.map((note, index) => (
          <li key={index} className="mb-2">
            <div className="flex">
              <input
                className="border rounded px-4 py-2 mr-2"
                type="text"
                value={note}
                onChange={(e) => handleEditNote(index, e.target.value)}
              />
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => handleDeleteNote(index)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyNotes;
