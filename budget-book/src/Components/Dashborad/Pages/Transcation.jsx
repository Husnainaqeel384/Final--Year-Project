import React, { useState } from 'react'
import { Category, subCategory } from '../../data/sidebarlinks'

const Transcation = () => {
  const [isOpen, setIsOpen] = useState(true);
  const toggleModal = () => {
    setIsOpen(!isOpen);
  }
  return (
    <>
      <div class="flex flex-col h-screen">
   
        <header class="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
          <h1 class="text-2xl font-bold">Budget Management System</h1>
         
        </header>

        <main class="p-4 flex-grow">
          <h2 class="text-2xl font-bold mb-4">Transactions</h2>
          <div class="flex flex-col md:flex-row justify-between mb-4">
            <form action="#" method="GET" class="flex items-center">
              <label for="search" class="sr-only">Search</label>
              <input type="text" id="search" name="search" placeholder="Search" class="border border-gray-500 py-2 px-3 rounded-l-lg focus:outline-none focus:border-gray-700" />
                <button type="submit" class="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-r-lg focus:outline-none">Search</button>
            </form>
            <a href="#" class="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded focus:outline-none">Add Transaction</a>
          </div>
          <div class="overflow-x-auto">
            <table class="table-auto border w-full">
              <thead>
                <tr>
                  <th class="px-4 py-2 border">Date</th>
                  <th class="px-4 py-2 border">Description</th>
                  <th class="px-4 py-2 border">Category</th>
                  <th class="px-4 py-2 border">Amount</th>
                  <th class="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="px-4 py-2 border">03/08/2023</td>
                  <td class="px-4 py-2 border">Groceries</td>
                  <td class="px-4 py-2 border">Food</td>
                  <td class="px-4 py-2 border">$50.00</td>
                  <td class="px-4 py-2 border">
                    <a href="#" class="text-blue-500 hover:text-blue-600">Edit</a>
                    <a href="#" class="text-red-500 hover:text-red-600 ml-2">Delete</a>
                  </td>
                </tr>
                <tr>
                  <td class="px-4 py-2 border">03/05/2023</td>
                  <td class="px-4 py-2 border">Gas bill</td>
                  <td class="px-4 py-2 border">Utilities</td>
                  <td class="px-4 py-2 border">$30.00</td>
                  <td class="px-4 py-2 border">
                    <a href="#" class="text-blue-500 hover:text-blue-600">Edit</a>
                    <a href="#" class="text-red-500 hover:text-red-600 ml-2">Delete</a>
                  </td>
                </tr>
                <tr>
                  <td class="px-4 py-2 border">03/01/2023</td>
                  <td class="px-4 py-2 border">Movie tickets</td>
                  <td class="px-4 py-2 border">Entertainment</td>
                  <td class="px-4 py-2 border">$20.00</td>
                  <td class="px-4 py-2 border">
                    <a href="#" class="text-blue-500 hover:text-blue-600">Edit</a>
                    <a href="#" class="text-red-500 hover:text-red-600 ml-2">Delete</a>
                  </td>
                </tr>
             
              </tbody>
            </table>
          </div>
        </main>

 
        <footer class="bg-gray-900 text-white px-4 py-3 flex justify-center">
          <p>&copy; 2023 Budget Management System</p>
        </footer>
      </div>
    </>
  )
}

export default Transcation