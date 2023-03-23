import React, { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
import { server } from '../../../store'
import Axios from 'axios'
import { Link, useLocation } from 'react-router-dom'
import { useStateContext } from '../../../context/ContextProvider'
import UpdateDailyExpense from './UpdateDailyExpense'
import UpdateMonthlyCategoryValue from './UpdateMonthlyCategoryValue'
import { toast } from 'react-hot-toast'
const UpdateMonthlyExpense = () => {
  const location = useLocation()
  const { id } = location.state
  const { openDailyExpense, setopenDailyExpense } = useStateContext();
  const [MonthlycategoryName, setMonthlycategoryName] = useState('')
  const [budgetDetailId, setbudgetDetailId] = useState('')
  const [monthlyExpenseId, setmonthlyExpenseId] = useState('')
  const [monthlyAmount, setmonthlyAmount] = useState('')
  const [Monthlyexpensevalue, setMonthlyexpensevalue] = useState([])
  // const navigate = useNavigate();
  // const updateeditexpense = (catergoryName,amount) => {
  //   console.log(catergoryName)
  //   navigate('/Budget/Update-Category-Value' ,{
  //     itemId: catergoryName,
  //     otherParam: amount,
  //   })
  // }

  const getmonthlyexpense = async () => {
    try {

      let token = localStorage.getItem('token')
      const { data } = await Axios.get(`${server}/getMonthlyExpense/${id}`, {

        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json',
          'authorization': `Bearer ${token}`
        }
      })

      setMonthlyexpensevalue(data.allBudgetDetailOfSpecificMonth)
    } catch (error) {
    }
  }
  const EditUpdateCategoryValue = async (name, mid) => {
    try {
      let token = localStorage.getItem('token')
      const { data } = await Axios.get(`${server}/GetMonthlyExpenseCategoryvalue/${id}/
          ${mid}/${name}`,
       
        {
          headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'authorization': `Bearer ${token}`
          }
        })

        setMonthlycategoryName(data.check[0].categoryName)
        setbudgetDetailId(mid)
        setmonthlyAmount(data.check[0].Amount)

        setopenDailyExpense(!openDailyExpense)
    } catch (error) {
      console.log(error.response.data.message)
    }

  }
  const DeleteCategoryValue = async (name, mid) => {
   
    try {
      let token = localStorage.getItem('token')
      const { data } = await Axios.delete(`${server}/deleteMonthlyExpenseCategory/${id}/${mid}`, {
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json',
          'authorization': `Bearer ${token}`
        }
      })
      toast.success(data.message)
      getmonthlyexpense()
    } catch (error) {
      console.log(error.response.data.message)
    }
  }

  useEffect(() => {
    getmonthlyexpense()
    setmonthlyExpenseId(id)

  }, [id])



  return (

    <div className='mt-16 md:mt-5 lg:mt-5'>
      {
        openDailyExpense && <UpdateMonthlyCategoryValue MonthlycategoryName={MonthlycategoryName} budgetDetailId={budgetDetailId} monthlyAmount={monthlyAmount} monthlyExpenseId={monthlyExpenseId} />
      }
      <h1 className="mb-4 text-3xl text-center font-extrabold text-gray-900 dark:text-white md:text-4xl lg:text-4xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">Update and Delete Expense</span> </h1>
      <div className=''>
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="p-4 w-1/6 border-r-4 border-indigo-400">
                <div className="flex items-center">
                  <p>SR.No</p>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 w-2/6 border-r-4 border-indigo-400">
                Category Name
              </th>
              <th scope="col" className="px-6 py-3 w-1/6 border-r-4 border-indigo-400">
                Amount
              </th>

              <th scope="col" className="px-6 py-3 w-1/6 border-r-4 border-indigo-400">
                Edit Amount
              </th>
              <th scope="col" className="px-6 py-3 w-1/6 ">
                Delete Category
              </th>
            </tr>
          </thead>
          <tbody>
            {
              Monthlyexpensevalue.map((items, index) => (
                <tr className="bg-white border-b  hover:bg-gray-50 " key={index}>
                  <td className="w-4 p-4 w-1/6 border-r-2 border-gray-200">
                    <div className="flex items-center">
                      <p>{index + 1}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4 w-2/6 border-r-2 border-gray-200 text-gray-500">
                    {items.categoryName}
                  </td>
                  <td className="px-6 py-4 w-2/6 border-r-2 border-gray-200 text-gray-500">
                    {items.Amount}
                  </td>

                  <td className="px-6 py-4 border-r-2 border-gray-200">
                    {/* <div className="flex items-center">
                <div className="h-2.5 w-2.5  mr-2"></div> Admin
              </div> */}
                    {/* <Link to={'/Budget/Update-Category-Value'}
                  state={{ categoryname: items.categoryName, amount: items.Amount }}

                  // onClick={() => { updateeditexpense(items.catergoryName,items.Amount) }}
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 ">
                  Edit</Link> */}
                    <button onClick={() => {
                      EditUpdateCategoryValue(items.categoryName, items.budgetDetail_id
                      )
                    }}
                      className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'>Edit</button>
                  </td>
                  <td className="px-6 py-4 ">
                    <button
                      onClick={() => {
                        DeleteCategoryValue(items.categoryName, items.budgetDetail_id
                        )
                      }}
                      className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:red:bg-blue-700 focus:outline-none dark:focus:ring-red-700 ">
                      Delete</button>
                  </td>
                </tr>

              ))
            }

          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UpdateMonthlyExpense