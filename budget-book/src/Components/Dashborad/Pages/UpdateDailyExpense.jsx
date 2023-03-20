import React, { useState, useEffect } from 'react'

import { useStateContext } from '../../../context/ContextProvider'
import { server } from '../../../store';
import { toast } from 'react-hot-toast'
// import { useNavigate } from 'react-router-dom'
import Axios from 'axios'


const UpdateDailyExpense = ({ expense_id }) => {
    const { openDailyExpense, setopenDailyExpense } = useStateContext();
    const [previousAmount, setpreviousAmount] = useState("");
    const [categoryName, setcategoryName] = useState('');
    const [Amount, setAmount] = useState('');


    const handleInputChange = (event) => {
        setpreviousAmount(event.target.value);
    };

    const handleNewInputChange = (event) => {
        setAmount(event.target.value);
    };

    const handleCancelClick = () => {
        setopenDailyExpense(false);
        setAmount('');
    };

    //this api get the on category name and amount
    const handlegetCategory = async () => {
        try {
            let token = localStorage.getItem('token')
            const { data } = await Axios.get(`${server}/GetExpenseCategory/${expense_id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json',
                    'authorization': `Bearer ${token}`
                }
            })
            setcategoryName(data.categoryDetail[0].ExpensecategoryName)
            setpreviousAmount(data.categoryDetail[0].currentAmount)
        } catch (error) {
            console.log(error.response.data.message)
        }
    };
    const handleSubmitClick = async () => {
        try {
            let token = localStorage.getItem('token')
            const { data } = await Axios.post(`${server}/updateExpenseCategory`, {
                ExpensecategoryName: categoryName,
                previousAmount,
                NewAmount: Amount
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-type': 'application/json',
                    'authorization': `Bearer ${token}`
                }
            })
            toast.success(data.message)
            setopenDailyExpense(!openDailyExpense)
        } catch (error) {
            console.log(error.response.data.message)
        }
    }
    useEffect(() => {
        handlegetCategory()
    }, [])

    return (
        <div className={`fixed z-10 inset-0 overflow-y-auto ${openDailyExpense ? '' : 'hidden'}`}>
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Update Daily Expense</h3>
                                <div className="mt-4">
                                    <h1 className="block text-gray-700 font-bold mb-2">
                                        Category Name
                                    </h1>
                                    <input
                                        id="option"
                                        name="option"
                                        value={categoryName}
                                        className="form-select w-full mb-4 px-4 py-2 rounded-md shadow-sm"
                                        readOnly
                                    />


                                    <label htmlFor="input" className="block text-gray-700 font-bold mb-2">
                                        Previous Amount
                                    </label>
                                    <input
                                        type="text"
                                        id="input"
                                        name="input"
                                        placeholder='0.00'
                                        className="form-input w-full mb-4 px-4 py-2 rounded-md shadow-sm border border-gray-200 text-center"
                                        value={previousAmount}
                                        onChange={handleInputChange}
                                    />
                                    <label htmlFor="input" className="block text-gray-700 font-bold mb-2">
                                        New Amount
                                    </label>
                                    <input
                                        type="text"
                                        id="input"
                                        name="input"
                                        placeholder='0.00'
                                        className="form-input w-full mb-4 px-4 py-2 rounded-md shadow-sm border border-gray-200 text-center"
                                        value={Amount}
                                        onChange={handleNewInputChange}
                                    />

                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={handleCancelClick}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={handleSubmitClick}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>


    )
}

export default UpdateDailyExpense