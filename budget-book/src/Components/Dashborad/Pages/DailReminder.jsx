import React,{useState} from 'react'
import Axios from 'axios'

const DailRemainder = () => {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [reminder, setReminder] = useState([])

  return (
   <>
     <div className="bg-blue-700 text-white text-center py-5">
      <h1 className="text-3xl font-bold">Reminders</h1>
    </div>
    <div className="container mx-auto flex justify-between items-start py-5">
      <div className="w-2/3 px-5 border rounded-lg bg-white">
        <h2 className="text-2xl font-bold mb-4">Upcoming Reminders</h2>
        <ul>
          <li className="mb-4">
            <div className="bg-blue-100 rounded-lg p-4">
              <h3 className="text-lg font-bold mb-2">Pay rent</h3>
              <p className="text-gray-500">Due on 15 March 2023</p>
            </div>
          </li>
          <li className="mb-4">
            <div className="bg-blue-100 rounded-lg p-4">
              <h3 className="text-lg font-bold mb-2">Buy groceries</h3>
              <p className="text-gray-500">On 20 March 2023</p>
            </div>
          </li>
          <li className="mb-4">
            <div className="bg-blue-100 rounded-lg p-4">
              <h3 className="text-lg font-bold mb-2">Submit tax return</h3>
              <p className="text-gray-500">Due on 31 March 2023</p>
            </div>
          </li>
        </ul>
      </div>
      <div className="w-1/3 px-5 border rounded-lg bg-white">
        <h2 className="text-2xl font-bold mb-4">Add New Reminder</h2>
        <form>
          <label className="block mb-2 font-bold" for="title">Title:</label>
          <input className="block w-full rounded-md py-2 px-3 bg-gray-200 mb-4 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" type="text" id="title" name="title" placeholder='Enter Reminder' />
          <label className="block mb-2 font-bold" for="date">Date:</label>
          <input className="block w-full rounded-md py-2 px-3 mb-4 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50" type="date" id="date" name="date" />
          <button className="bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-600" type="submit">Add Reminder</button>
        </form>
      </div>
    </div>

   
   </>
  )
}

export default DailRemainder