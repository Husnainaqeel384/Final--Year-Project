import React, { useState, useEffect } from 'react'
import { Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, ArcElement, Legend } from "chart.js";
import ClipLoader from "react-spinners/ClipLoader"
import axios from 'axios'
import { server } from '../../../store'
import { toast } from 'react-toastify';
ChartJS.register(Tooltip, ArcElement, Legend);
const Report = () => {
    let [loading, setLoading] = useState(true);
    let [color, setColor] = useState("#ffffff");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [monthname, setMonthname] = useState([])
    const [isopen, setIsopen] = useState(false)
    const data = {
        labels: ['Red', 'Blue', 'Yellow'],
        datasets: [
            {
                label: 'My First Dataset',
                data: [50000, 10000, 500],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            },
        ],
    };
    const reportmonth = async () => {
        setLoading(true)
        let token = localStorage.getItem('token')
        const { data } = await axios.get(`${server}/report/month`, {
            headers: {

                'Content-Type': 'application/json',
                'authorization': `Bearer ${token}`
            }
        })

        setMonthname(data.months)
    }
    const generateReport = async () => {
        if (selectedMonth === "") {
            toast.error("Please Select Month", {
                position: toast.POSITION.TOP_CENTER
                })
        } else {
            try {
                setLoading(true)
                let token = localStorage.getItem('token')
                const { data } = await axios.get(`${server}/report/${selectedMonth}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${token}`
                    }
                })
                console.log(data)
                setLoading(false)
                setIsopen(true)

            } catch (error) {
                toast.error("Something Went Wrong", {
                    position: toast.POSITION.TOP_CENTER
                })
            }


        }
    }


    useEffect(() => {
        reportmonth()
    }, [])
    return (
        <div className="flex flex-col h-screen">
            <header className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Reports</h1>
            </header>
            <main className="p-4 flex-grow">
                <div className="flex flex-col md:flex-row justify-between mb-4">
                    <div className="flex items-center">
                        <label htmlFor="start-date" className="mr-2">Start Month:</label>
                        <select name="" id=""
                            value={selectedMonth}
                            onChange={(e) => { setSelectedMonth(e.target.value) }}
                            className="border border-gray-500 py-2 px-3 rounded-lg focus:outline-none focus:border-gray-700">
                            <option value="">-- Select Month --</option>
                            {
                                monthname.map((month, index) => {
                                    return <option key={index} value={month.BudgetMonth}>{month.BudgetMonth}</option>
                                })
                            }
                        </select>
                    </div>
                    <button
                        onClick={() => generateReport()
                        }

                        className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded focus:outline-none mt-4 md:mt-0">Generate Report</button>
                </div>
                {
                    isopen ? (
                        <div>
                            <h3 className="text-xl font-bold mb-2 text-center">Expense Report</h3>
                            <div className="flex flex-col md:flex-row justify-between p-1 ">
                                <div className="w-full md:w-1/2 mb-4 md:mb-0 ">
                                    <h3 className='text-xl font-bold mb-2 border-b'>Current Month
                                        Expense
                                    </h3>
                                    <div className='md:flex md:w-full '>
                                        <h3 className='text-lg font-bold mb-2 md:w-1/2' >Expense Month</h3>
                                        <span className=' text-lg md:w-1/2'>March-2023</span>
                                    </div>
                                    <div className='md:flex md:w-full '>
                                        <h3 className='text-lg font-bold mb-2 md:w-1/2' >Total Income</h3>
                                        <span className=' text-lg md:w-1/2'>50000</span>
                                    </div>
                                    <div className='md:flex md:w-full'>
                                        <h3 className='text-lg font-bold mb-2 md:w-1/2' >Saving Amount</h3>
                                        <span className=' text-lg md:w-1/2'>10000</span>
                                    </div>
                                </div>
                                <div className="w-full md:w-1/2 mb-4 md:mb-0 ">
                                    <h3 className='text-xl font-bold mb-2 border-b'>Previou Month
                                        Expense
                                    </h3>

                                    <div className='md:flex md:w-full '>
                                        <h3 className='text-lg font-bold mb-2 md:w-1/2' >Total Income</h3>
                                        <span className=' text-lg md:w-1/2'>50000</span>
                                    </div>
                                    <div className='md:flex md:w-full'>
                                        <h3 className='text-lg font-bold mb-2 md:w-1/2' >Saving Amount</h3>
                                        <span className=' text-lg md:w-1/2'>10000</span>
                                    </div>
                                    <div className='md:flex md:w-full '>
                                        <h3 className='text-lg font-bold mb-2 md:w-1/2' >Remaining Amount</h3>
                                        <span className=' text-lg md:w-1/2'>March-2023</span>
                                    </div>
                                </div>

                            </div>
                            <div className='w-full flex flex-col md:flex-row' >
                                <div className='w-full md:w-1/2 h-40'>
                                    <aside className='h-80'>

                                        <Pie data={data} />
                                    </aside>
                                </div>
                                <div className='w-full md:w-1/2 '>
                                    <aside className='h-80'>

                                        <Doughnut data={data} />
                                    </aside>
                                </div>
                            </div>
                            <div className='w-full' >
                                <table className="table-auto border w-full">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 border">Sr.No</th>
                                            <th className="px-4 py-2 border">Catgroy Name</th>
                                            <th className="px-4 py-2 border">Expense Amount</th>

                                            <th className="px-4 py-2 border">Remaining Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="border px-4 py-2">1</td>
                                            <td className="border px-4 py-2">Food</td>
                                            <td className="border px-4 py-2">5000</td>
                                            <td className="border px-4 py-2">4000</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <ClipLoader
                            color={color}
                            loading={loading}
                            size={150}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                        />
                    )
                }
            </main>

        </div>
    )
}

export default Report