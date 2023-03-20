import React, { useState, useEffect } from 'react'
// import { AiOutlineSearch, AiOutlineDelete } from 'react-icons/ai'
import { Link, useNavigate } from 'react-router-dom'
import { server } from '../../../store';
import Axios from 'axios'
import { toast } from 'react-hot-toast';

const ALLBudgtes = () => {
  const navigate = useNavigate()
  const [values, setValues] = useState([])
  const getAllBudget = async () => {
    try {
      const token = localStorage.getItem('token')
      const { data } = await Axios.get(`${server}/getAllBudget`, {
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json',
          'authorization': `Bearer ${token}`
        }
      })
      setValues(data.allBudgetDetail)
    } catch (error) {
      toast.error(error.response.data.message)
    }
  }
  useEffect(() => {
    getAllBudget()
  }, [])


  const updateExpense = () => {
    // to={'/Budget/Edit-Expense'}
    navigate('/Budget/Edit-Expense')
  }
  const deleteExpense = async (id) => {

    try {
      let token = localStorage.getItem('token')
      const { data } = await Axios.delete(`${server}/deleteBudget/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json',
          'authorization': `Bearer ${token}`
        }
      })
      toast.success(data.message)
      getAllBudget()
    } catch (error) {
      toast.error(error.response.data.message)
    }
  }



  return (
    <>

      <div className=" mt-16 md:mt-5 overflow-x-auto shadow-md -z-1 ">
        <div className="ml-16 text-lg ">
          <h1 className="mb-4 text-3xl md:mt-12  font-extrabold text-gray-900 dark:text-white md:text-4xl lg:text-4xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">All Budgets</span> </h1>

        </div>

        {/* <div class="flex items-center justify-between pt-3 pb-4 bg-white  " >
          <label for="table-search" class="sr-only">Search</label>
          <div class="relative ">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3  pointer-events-none">
              <AiOutlineSearch className="text-white " />
            </div>
            <input type="text" id="table-search-users" class="block p-2 pl-10 text-sm  text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search for users" />
          </div>
        </div> */}
        <div>
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="p-4 w-1/6 border-r-4 border-indigo-400">
                  <div className="flex items-center">
                    <p>SR.No</p>
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 w-1/6 border-r-4 border-indigo-400">
                  Budget Month
                </th>
                <th scope="col" className="px-6 py-3 w-1/6 border-r-4 border-indigo-400">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 w-1/6 border-r-4 border-indigo-400">
                  saving Amount
                </th>

                <th scope="col" className="px-6 py-3 w-1/6 border-r-4 border-indigo-400">
                  View
                </th>
                <th scope="col" className="px-6 py-3 w-1/6 ">
                  Delete Expense
                </th>
              </tr>
            </thead>
            <tbody>
              {
                values.map((items, index) => (
                  <tr className="bg-white border-b  hover:bg-gray-50 " key={index}>
                    <td className="w-4 p-4 w-1/6 border-r-2 border-gray-200">

                      <p>{index + 1}</p>

                    </td>

                    <td className="px-6 py-4 w-1/6 border-r-2 border-gray-200 text-gray-500">
                      {items.BudgetMonth}
                    </td>
                    <td className="px-6 py-4 w-1/6 border-r-2 border-gray-200 text-gray-500">
                      {items.Total_Income
                      }
                    </td>
                    <td className="px-6 py-4 w-1/6 border-r-2 border-gray-200 text-gray-500">
                      {items.Saving
                      }
                    </td>

                    <td className="px-6 py-4 border-r-2 border-gray-200">

                      <Link to={'/Budget/Edit-Expense'}  state={{ id:items.budget_id }}
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 ">
                        View</Link>
                    </td>
                    <td className="px-6 py-4 ">
                      <button onClick={() => deleteExpense(items.budget_id)} className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:red:bg-blue-700 focus:outline-none dark:focus:ring-red-700 ">
                        Delete</button>
                    </td>
                  </tr>

                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default ALLBudgtes