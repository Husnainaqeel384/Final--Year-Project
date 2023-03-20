import React, { useState, useEffect } from 'react'
import { useStateContext } from '../../../context/ContextProvider'
import { server } from '../../../store';
import Addexpense from './Addexpense';
import Axios from 'axios'
import { Link } from 'react-router-dom';
import UpdateDailyExpense from './UpdateDailyExpense';
const Expense = () => {
    const [dailyexpense, setdailyExpense] = useState([])
    const [expenseId, setExpenseId] = useState(null);
    const [categoryname, setcategoryname] = useState(null);
    const [categoryamount, setcategoryamount] = useState(null);
    const { openExpenseDropdown, setopenExpenseDropdown, openDailyExpense, setopenDailyExpense } = useStateContext();
    const EditUpdateExpense = (id, name, amount) => {
        setopenDailyExpense(!openDailyExpense)
        setExpenseId(id)
        setcategoryname(name)
        setcategoryamount(amount)
    }
    const GetDailyRecordHistory = async () => {
        try {
            let token = localStorage.getItem('token')
            const { data } = await Axios.get(`${server}/GetDailyRecordHistory`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json',
                    'authorization': `Bearer ${token}`
                }
            })

            setdailyExpense(data.dailyrecordhistory)

        } catch (error) {

        }
    }
    useEffect(() => {
        GetDailyRecordHistory()
    }, [setdailyExpense])


    return (
        <>
            {
                openExpenseDropdown && <Addexpense />
            }
            {
                openDailyExpense && <UpdateDailyExpense expense_id={expenseId} categoryname={categoryname} categoryamount={categoryamount} />
            }
            <div className='md:mt-0 mt-12'>
                <h1 className="mb-4 text-3xl text-center font-extrabold text-gray-900 dark:text-white md:text-4xl lg:text-4xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">Add Your Daily Expenses </span> </h1>
                <div className='mt-4 border border-gray-200'>
                    <button onClick={() => setopenExpenseDropdown(!openExpenseDropdown)} className="text-white mt-4   p-2 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 ">Add Expense</button>

                </div>
                <div>
                    <h1>Your Daily Expense Record Here</h1>
                    <div className="overflow-x-auto">
                        <table className="table-auto border w-full">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border">Category</th>
                                    <th className="px-4 py-2 border">Amount</th>
                                    <th className="px-4 py-2 border">Description</th>
                                    <th className="px-4 py-2 border">Total Amount</th>
                                    <th className="px-4 py-2 border">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dailyexpense.length > 0 ? (
                                    dailyexpense.map((data, index) => {
                                        return (
                                            <tr key={index}>
                                                <td className="px-4 py-2 border">{data.ExpensecategoryName}</td>
                                                <td className="px-4 py-2 border">{data.currentAmount}</td>
                                                <td className="px-4 py-2 border">{data.description}</td>
                                                <td className="px-4 py-2 border">{data.Totalamount}</td>
                                                <td className="px-4 py-2 border">
                                                    <button onClick={() => EditUpdateExpense(data.expense_id, data.ExpensecategoryName, data.currentAmount)} className="text-blue-500 hover:text-blue-600">Edit</button>
                                                    <button className="text-red-500 hover:text-red-600 ml-2">Delete</button>
                                                </td>
                                            </tr>
                                        )
                                    })) : (
                                    <tr>
                                        <td className="px-4 py-2 border" colSpan="5">No records found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Expense