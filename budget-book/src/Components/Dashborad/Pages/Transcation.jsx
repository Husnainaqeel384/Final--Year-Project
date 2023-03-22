import React, { useState } from 'react'
import {Link} from 'react-router-dom'
const Transcation = () => {
  const [isOpen, setIsOpen] = useState(true);
  const toggleModal = () => {
    setIsOpen(!isOpen);
  }
  return (
    <>
      <div className="flex flex-col h-screen">
   
        <header className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Budget Management System</h1>
         
        </header>

        <main className="p-4 flex-grow">
          <h2 className="text-2xl font-bold mb-4">Transactions</h2>
          <div className="flex flex-col md:flex-row justify-between mb-4">
            <form action="#" method="GET" className="flex items-center">
              <label htmlFor="search" className="sr-only">Search</label>
              <input type="text" id="search" name="search" placeholder="Search" className="border border-gray-500 py-2 px-3 rounded-l-lg focus:outline-none focus:border-gray-700" />
                <button type="submit" className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-r-lg focus:outline-none">Search</button>
            </form>
            <Link className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded focus:outline-none">Add Transaction</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table-auto border w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Date</th>
                  <th className="px-4 py-2 border">Description</th>
                  <th className="px-4 py-2 border">Category</th>
                  <th className="px-4 py-2 border">Amount</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border">03/01/2023</td>
                  <td className="px-4 py-2 border">Movie tickets</td>
                  <td className="px-4 py-2 border">Entertainment</td>
                  <td className="px-4 py-2 border">$20.00</td>
                  <td className="px-4 py-2 border">
                    {/* <a href="#" className="text-blue-500 hover:text-blue-600">Edit</a> */}
                    {/* <a href="#" className="text-red-500 hover:text-red-600 ml-2">Delete</a> */}
                  </td>
                </tr>
             
              </tbody>
            </table>
          </div>
        </main>

 
        <footer className="bg-gray-900 text-white px-4 py-3 flex justify-center">
          <p>&copy; 2023 Budget Management System</p>
        </footer>
      </div>
    </>
  )
}

export default Transcation