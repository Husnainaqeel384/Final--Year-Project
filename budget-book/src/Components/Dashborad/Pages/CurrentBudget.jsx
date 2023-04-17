import React, { useEffect, useState } from 'react'
import Axios from 'axios'
import { server } from '../../../store'
import { Line } from 'rc-progress';
const CurrentBudget = () => {
  const [data, setData] = useState([])
const [totalIncome, setTotalIncome] = useState(0)
const [totalbudgetAmount,settotalbudgetAmount]=useState(0)
const [savingAmount,setsavingAmount]=useState(0)
  const getmonthlyexpense = async () => {

    try {
      let token = localStorage.getItem('token')
      const { data } = await Axios.get(`${server}/getMonthlyExpensedata`, {
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json',
          'authorization': `Bearer ${token}`
        }
      })
      setData(data.monthExpenseData)
      setTotalIncome(data.Income)
      settotalbudgetAmount(data.TotalBudgetAmount)
      setsavingAmount(data.saving)
    } catch (error) {
    }
  }
  useEffect(() => {
    getmonthlyexpense()
  }, [])




  // const data = [
  //   {
  //     catergoryName: "Water",
  //     Amount: 123
  //   }, {
  //     catergoryName: "Electricity",
  //     Amount: 123
  //   },
  //   {
  //     catergoryName: "Gas/Oil",
  //     Amount: 123
  //   }, {
  //     catergoryName: "Phone",
  //     Amount: 123
  //   }, {
  //     catergoryName: "Internet",
  //     Amount: 123
  //   }, {
  //     catergoryName: "Lawn/Garden",
  //     Amount: 123
  //   }, {
  //     catergoryName: "Maintenance",
  //     Amount: 123
  //   },
  // ]
  return (
    <div className='mt-16 md:mt-5 lg:mt-5'>
      <h1 className="mb-4 text-3xl text-center font-extrabold text-gray-900 dark:text-white md:text-4xl lg:text-4xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">Your Current Budget</span> </h1>
      <div className='w-full border md:flex md:flex-wrap ' >
        <div className='w-full md:w-1/2 border-r-2 border-gray-200 md:flex'>  
            <span className='w-1/2 font-bold text-lg text-center border p-2'>Total Income</span>
            <span className='w-1/2 text-center text-lg border p-2'>{totalIncome}</span>
          </div>
          <div className='w-full md:w-1/2 border-r-2 border-gray-200 md:flex'>  
            <span className='w-1/2 font-bold text-lg text-center border p-2'>Saving Amount</span>
            <span className='w-1/2 text-center text-lg border p-2'>{savingAmount}</span>
          </div>
          <div className='w-full md:w-1/2 border-r-2 border-gray-200 md:flex'>  
            <span className='w-1/2 font-bold text-lg text-center border p-2'>Total Budget Amount</span>
            <span className='w-1/2 text-center text-lg font-semibold  border p-2'>{totalbudgetAmount}</span>
          </div>
          <div className='w-full md:w-1/2 border-r-2 border-gray-200 md:flex'>  
            
          </div>
        
      </div>
      <div className=''>
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="p-4 w-1/6 border-r-4 border-indigo-400">

                SR.No

              </th>
              <th scope="col" className="px-6 py-3 w-1/6 border-r-4 border-indigo-400">
                Category Name
              </th>
              <th scope="col" className="px-6 py-3 w-1/6 border-r-4 border-indigo-400">
                Expense Amount
              </th>


              <th scope="col" className="px-6 py-3 w-1/6 border-r-4 border-indigo-400">
                Remaining Amount
              </th>
              <th scope="col" className="px-6 py-3 w-1/6 border-r-4 border-indigo-400">
                Progress Bar
              </th>
            </tr>
          </thead>
          <tbody>
            {

              data.length > 0 ? (
                data.map((items, index) => (
                  <tr className="bg-white border-b  hover:bg-gray-50 " key={index}>
                    <td className=" p-4 w-1/6 border-r-2 border-gray-200">
                      <div className="flex items-center">
                        <p>{index + 1}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4 w-1/6 border-r-2 border-gray-200 text-gray-500">
                      {items.categoryName}
                    </td>
                    {/* <td scope="row" className="flex pl-3 items-center w-1/6 px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white border-r-2 border-gray-200 text-gray-500">
                    <div className="  ">
                      <div className="text-black font-semibold "></div>
                    </div> */}
                    <td className="px-6 py-4 border-r-2 border-gray-200 text-gray-500">
                      {items.Amount}
                      {/* </td> */}
                    </td>


                    <td className="px-6 py-4 border-r-2 border-gray-200 text-gray-500">
                      {
                      items.remainingAmount === 0 ? (
                        <>
                        <div className='flex justify-between'>
                        <span className="text-green-500">-</span>
                        <span className="text-green-500"></span>
                        </div>
                        </>
                      ) : (
                        <span className="text-green-500 font-semibold">{items.remainingAmount}</span>
                      )
                      }
                    </td>
                    <td className="px-6 py-4 border-r-2 border-gray-400 text-gray-500">
                      {items.percentofUsingAmount + "%"}
                      {items.percentofUsingAmount >= 100 ? (

                        <Line percent={100} strokeWidth={10} strokeColor="red" />
                      ) : (
                        <Line percent={items.percentofUsingAmount} strokeWidth={10} strokeColor="green" />
                      )
                      }

                    </td>
                  </tr>

                ))

              ) : (
                <tr>
                  <td className="px-4 py-2 border" colSpan="5">No records found</td>
                </tr>
              )

            }

          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CurrentBudget
