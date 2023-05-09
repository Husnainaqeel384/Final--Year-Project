import React, { useEffect, useState } from 'react';
import { server } from '../../../store';
import Axios from 'axios'
import { toast } from 'react-toastify';
const MyNotes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const AddNotes = async () => {

    try {
      const token = localStorage.getItem('token');
      const { data } = await Axios.post(`${server}/addNotes`, {
        Notes: newNote
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json',
          'authorization': `Bearer ${token}`
        }
      })
      toast.success(data.message, {
        position: toast.POSITION.TOP_RIGHT
      })
      setNewNote('')
      getNotes()
    } catch (error) {
      toast.error(error.response.data.message, {
        position: toast.POSITION.TOP_RIGHT
      })

    }
  }
  const getNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await Axios.get(`${server}/getNotes`, {
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json',
          'authorization': `Bearer ${token}`
        }
      })
      setNotes(data.getnotes)
    } catch (error) {
      toast.error(error.response.data.message, {
        position: toast.POSITION.TOP_RIGHT
      })
    }
  }
  const deleteNotes = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await Axios.delete(`${server}/deletenote/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json',
          'authorization': `Bearer ${token}`
        }
      })
      toast.success(data.message, {
        position: toast.POSITION.TOP_RIGHT
      })
      getNotes()
    } catch (error) {
      toast.error(error.response.data.message, {
        position: toast.POSITION.TOP_RIGHT
      })
    }
  }
  const updateNotes = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await Axios.put(`${server}/updatenote/${editId}`, {
        Notes: newNote
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json',
          'authorization': `Bearer ${token}`
        }
      })
      toast.success(data.message, {
        position: toast.POSITION.TOP_RIGHT
      })
      setIsEditing(false)
      getNotes()
    } catch (error) {
      toast.error(error.response.data.message, {
        position: toast.POSITION.TOP_RIGHT
      })
    }
  }
  useEffect(() => {
    getNotes()
  }, [])


  return (
    <div className="flex flex-col h-screen bg-gray-200">
      <h1 className="mb-4 text-3xl font-bold text-center text-gray-800">
        My Notes
      </h1>


      <div className="flex flex-row">

        <div className="w-3/4 p-4">
          <table className="w-full table-fixed border border-slate-900 ">
            <thead>
              <tr>
                <th className="w-1/6  px-4 py-2 border-2 border-slate-900">Sr No.</th>
                <th className="w-4/6 px-4 py-2 border-2 border-slate-900">Notes</th>
                <th className="w-1/6 px-4 py-2 border-2 border-slate-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note, index) => (
                <tr key={index}>
                  <td className="text-center w-1/6 px-4 py-2 border-2 border-slate-900">
                    {index + 1}
                  </td>
                  <td className="w-4/6 px-4 py-2 border-2 border-slate-900">
                    {note.Notes}
                  </td>
                  <td className="text-center w-1/6 px-4 py-2 border-2 border-slate-900">
                    
                      <button
                        className="px-2 py-1 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600"
                        onClick={() => {
                          setIsEditing(true);
                          setNewNote(note.Notes);
                          setEditId(note.id);
                        }}
                      >
                        Edit
                      </button>
      
                    <button
                      className="ml-2 px-2 py-1 text-sm font-medium text-white bg-red-500 rounded hover:bg-blue-600"
                      onClick={() => {
                        deleteNotes(note.id);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="w-1/4 p-4">

          {
            isEditing ? (
              <>
                <h1 className=' text-2xl font-bold text-center text-gray-800'>Edit Notes</h1>
                <div >
                  <textarea
                    className="w-full h-48 px-3 py-2 mb-4 text-base text-gray-700 placeholder-gray-600 border rounded-lg focus:outline-none focus:shadow-outline resize-none"
                    placeholder="Type your note here..."
                    value={newNote}
                    onChange={(event) => setNewNote(event.target.value)}
                  />
                  <button
                    onClick={() => { updateNotes() }}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600"
                  >
                    Update Note
                  </button>
                  <button
                
                   className="w-full px-4 py-2 text-sm font-medium mt-2 text-black bg-white rounded hover:bg-blue-600"
                    onClick={() => {
                      setIsEditing(false);
                      setEditId(null);
                    }}
                  >
                     Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 className='text-2xl font-bold text-center text-gray-800'>Add Notes</h1>
                <div >
                  <textarea
                    className="w-full h-48 px-3 py-2 mb-4 text-base text-gray-700 placeholder-gray-600 border rounded-lg focus:outline-none focus:shadow-outline resize-none"
                    placeholder="Type your note here..."
                    value={newNote}
                    onChange={(event) => setNewNote(event.target.value)}
                  />
                  <button onClick={AddNotes}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600"
                    type="submit"
                  >
                    Add Note
                  </button>
                </div>
              </>
            )
          }

        </div>
      </div>
    </div>
  );
};

export default MyNotes;