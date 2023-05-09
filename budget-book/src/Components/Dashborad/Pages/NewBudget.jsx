import React, { useState } from 'react'
// import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Axios from 'axios'
import { server } from '../../../store'
const NewBudget = () => {
    const [income,setIncome]=useState(0)
    const [AnotherIncome,setAnotherIncome]=useState(0)
    const [saving,setSaving]=useState(0)
    const navigate = useNavigate()
    const submitbudget = async() => {

        if(income===0){
            toast.error('Please Enter Monthly Income')
        }
        else if(saving===0)
        {
            toast.error('Please Enter Monthly Saving Amount')
        }
       else {
        const total = parseFloat(income) +parseFloat(AnotherIncome) 
        
        const token = localStorage.getItem('token')
    
        try {
            const {data}= await Axios.post( `${server}/budget`,{
                TotalIncome:total,
                saving:saving
            },{
                headers:{
                    'Accept': 'application/json',
                    'Content-type': 'application/json',
                    'authorization': `Bearer ${token}`
                }
            })
            toast.success(data.message,{position:'top-center'})
            navigate('/Budget/Budget-detail')

        } catch (error) {
            toast.error(error.response.data.message,{position:'top-center'})
        }

       }
    }
    return (
        <>
            <div className='mt-16 md:mt-5 lg:mt-5'>
                <h1 className="mb-4 text-3xl text-center font-extrabold text-gray-900 dark:text-white md:text-4xl lg:text-4xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">Let's Create Your Monthly Budget.</span> </h1>
                <div className="mb-6 md:ml-10 lg:ml-10" >
                    <div>
                        {/* <label htmlFor="success" className="block mb-2 text-lg font-medium text-gray-700 dark:text-gray-500">Enter Your Expense Date</label> */}
                        {/* <input type="date" id="success" className="bg-white border border-green-500 text-white dark:text-white placeholder-green-700 dark:placeholder-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-96 p-2.5 dark:bg-gray-700 dark:border-green-500" placeholder="Enter Your Budget Name"  minLength={4} maxLength={30}  /> */}
                        <label htmlFor="success"  className="block mb-2 text-lg font-medium text-gray-700 dark:text-gray-500">Enter Your Monthly Income</label>
                        <input type="number" id="success" onChange={(e)=>setIncome(e.target.value)} className="bg-white border border-green-500 text-white dark:text-white placeholder-green-700 dark:placeholder-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-96 p-2.5 dark:bg-gray-700 dark:border-green-500" placeholder="Enter Your Monthly Income" minLength={4} maxLength={9} />
                        <label htmlFor="success" className="block mb-2 text-lg font-medium text-gray-700 dark:text-gray-500">Enter Your Another Source of Income</label>
                        <input type="number"  id="success" onChange={(e)=>setAnotherIncome(e.target.value)}  className="bg-white border border-green-500 text-white dark:text-white placeholder-green-700 dark:placeholder-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-96 p-2.5 dark:bg-gray-700 dark:border-green-500" placeholder="Enter Your Another Source of Income" minLength={4} maxLength={9} />
                        <label htmlFor="success" className="block mb-2 text-lg font-medium text-gray-700 dark:text-gray-500">Enter Your Saving Amount</label>
                        <input type="number" id="success" onChange={(e)=>setSaving(e.target.value)} className="bg-white border border-green-500 text-white dark:text-white placeholder-white dark:placeholder-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-96 p-2.5 dark:bg-gray-700 dark:border-green-500" placeholder="Enter Your Saving Amount" />
                        <div className='mt-5'>
                            <button onClick={submitbudget} 
                             className="w-96 px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:bg-purple-600">
                                Create New Expense
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NewBudget