import React, { useState, useEffect } from 'react'
import Axios from 'axios'
import { server } from '../../../store'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const DailRemainder = () => {
  const [reminderId, setReminderId] = useState('')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [update, setUpdate] = useState(false)
  const [reminder, setReminder] = useState([])
  const addReminder = async (e) => {
    // e.preventDefault()
    try {
      if (title === '' || date === '') {
        toast.error('Please Enter Title and Date', { position: toast.POSITION.TOP_CENTER })
      } else {

        let token = localStorage.getItem('token')
        const { data } = await Axios.post(`${server}/AddReminder`, {
          Reminder_title: title,
          ReminderDate: date
        },
          {
            headers: {
              'Accept': 'application/json',
              'Content-type': 'application/json',
              'authorization': `Bearer ${token}`
            }
          })
        getReminderData()
        toast.success(data.message, { position: toast.POSITION.TOP_CENTER });
        setTitle('')
        setDate('')
      }
    } catch (error) {
      toast.error(error.response.data.message, { position: toast.POSITION.TOP_CENTER });
    }

  }
  const getReminderData = async () => {

    let token = localStorage.getItem('token')
    const { data } = await Axios.get(`${server}/getReminder`, {
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
        'authorization': `Bearer ${token}`
      }
    })
    setReminder(data.data)

  }
  const statusdone = async (id) => {
    try {
      let token = localStorage.getItem('token')
      const { data } = await Axios.post(`${server}/statusdone`, {
        Reminder_id: id
      },
        {
          headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'authorization': `Bearer ${token}`
          }
        }

      )
      toast.success(data.message, { position: toast.POSITION.TOP_CENTER });
      getReminderData()
    } catch (error) {
      toast.error(error.response.data.message, { position: toast.POSITION.TOP_CENTER });
    }
  }
  const EditReminder = async () => {

    try {
      let token = localStorage.getItem('token')
      const { data } = await Axios.post(`${server}/EditReminder`, {
        Reminder_id: reminderId,
        Reminder_title: title,
        ReminderDate: date

      },
        {
          headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'authorization': `Bearer ${token}`
          }
        }

      )
      toast.success(data.message, { position: toast.POSITION.TOP_CENTER });
      getReminderData()
      setUpdate(false)
      setTitle('')
      setDate('')
    } catch (error) {
      toast.error(error.response.data.message, { position: toast.POSITION.TOP_CENTER });
    }
  }
  const DeleteReminder = async (id) => {
    try {
      let token = localStorage.getItem('token')
      const { data } = await Axios.post(`${server}/DeleteReminder`, {
        Reminder_id: id
      },
        {
          headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'authorization': `Bearer ${token}`
          }
        })
      toast.success(data.message, { position: toast.POSITION.TOP_CENTER });
      getReminderData()



    } catch (error) {
      toast.error(error.response.data.message, { position: toast.POSITION.TOP_CENTER });
    }


  }


  useEffect(() => {
    getReminderData()
  }, [])


  return (
    <>
      <div className="bg-blue-700 text-white text-center py-5">
        <h1 className="text-3xl font-bold">Reminders</h1>
      </div>
      <div className="container mx-auto flex justify-between items-start py-5">
        <div className="w-2/3 px-5 border rounded-lg bg-white ">
          <h2 className="text-2xl font-bold mb-4">Upcoming Reminders</h2>
          <ul>
            {
              reminder.map((item, index) => {
                return (

                  <li className="mb-4" key={index}>
                    <div className="bg-blue-100 rounded-lg p-4">
                      <h3 className="text-lg font-bold mb-2">{item.Reminder_title}</h3>
                      <p className="text-gray-500">Due on {item.ReminderDate} </p>
                      <span className='font-bold'>Status : {item.Status}</span>
                      <div className='w-full p-2 ml-80 '>
                        {
                          item.Status === 'Pending' ? (
                            <>
                              <button
                                onClick={() => { statusdone(item.Reminder_id) }}
                                className='bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-600 ml-2'>Done</button>
                              <button onClick={() => {
                                setReminderId(item.Reminder_id)
                                setUpdate(true)
                                setDate(item.ReminderDate)
                                setTitle(item.Reminder_title)
                              }}
                                className='bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-600 ml-2 '>Edit</button>
                            </>
                          ) : ''
                        }

                        <button onClick={() => { DeleteReminder(item.Reminder_id) }}
                          className='bg-red-700 text-white py-2 px-4 rounded-lg hover:bg-red-600 ml-2'>Delete</button>

                      </div>
                    </div>
                  </li>

                )
              })
            }

          </ul>
        </div>
        <div className="w-1/3 px-5 border rounded-lg bg-whitep-2">
          {
            update ? <h2 className="text-2xl font-bold mb-4">Update Reminder</h2> : <h2 className="text-2xl font-bold mb-4">Add Reminder</h2>
          }
          {/* <form onSubmit={addReminder} > */}
          <label className="block mb-2 font-bold" htmlFor="title">Title:</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full rounded-md py-2 px-3 bg-gray-200 mb-4 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" type="text" id="title" name="title" placeholder='Enter Reminder' />
          <label className="block mb-2 font-bold" htmlFor="date">Date:</label>
          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="block w-full rounded-md py-2 px-3 mb-4 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" type="date" id="date" name="date" />
          {
            update ? <button onClick={() => { EditReminder() }} className="bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-600">Update</button> : <button onClick={addReminder} className="bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-600">Add</button>

          }
          {/* </form> */}
        </div>
      </div>


    </>
  )
}

export default DailRemainder