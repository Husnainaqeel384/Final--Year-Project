import React, { useState, useEffect } from 'react'
import { Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, ArcElement, Legend } from "chart.js";
import ClipLoader from "react-spinners/ClipLoader"
import axios from 'axios'
import { server } from '../../../store'
import { toast } from 'react-toastify';
ChartJS.register(Tooltip, ArcElement, Legend);
const Report = () => {
    let [loading, setLoading] = useState(false);
    let [color, setColor] = useState("#ffffff");
    const [totalbudgetAmount, setTotalbudgetAmount] = useState(0)
    const [SelectedMonthName, setSelectedMonthName] = useState("")
    const [selectMonthSaving, setSelectMonthSaving] = useState(0)
    const [totalincome, setTotalincome] = useState(0)
    const [totalSpendAmount, setTotalSpendAmount] = useState(0)
    const [totalPreviousMonthSaving, setTotalPreviousMonthSaving] = useState(0)
    const [totalPreviousMonthIncome, setTotalPreviousMonthIncome] = useState(0)

    const [PreviousMonthName, setPreviousMonthName] = useState("")
    //this is the total saving amount subtract total budget amount from total spent amount
    const [totalSaving, setTotalSaving] = useState(0)
    const [budgetDetails, setBudgetDetails] = useState([])

    const [selectedMonth, setSelectedMonth] = useState("");
    const [monthname, setMonthname] = useState([])
    const [isopen, setIsopen] = useState(false)
    const data = {
        labels: ['Total Income', 'Total Budget Amount', 'Spend Amount'],
        datasets: [
            {
                label: 'My First Dataset',
                data: [totalincome, totalbudgetAmount, totalSpendAmount],
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
                setBudgetDetails(data.budgetdetail)
                setTotalbudgetAmount(data.totalbudgetAmount)
                setTotalSpendAmount(data.totalSpentAmount)
                setTotalincome(data.budget[0].Total_Income)
                setSelectedMonthName(data.budget[0].BudgetMonth)
                setSelectMonthSaving(data.budget[0].Saving)
                setTotalPreviousMonthSaving(data.previousMonth[0].Saving)
                setTotalPreviousMonthIncome(data.previousMonth[0].Total_Income)
                // setTotalPreviousMonthBudget(data.budget[0].PreviousMonthBudget)
                setPreviousMonthName(data.previousMonth[0].BudgetMonth)
                setTotalSaving(data.totalSavingAmount)
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
                        <div className='border border-4' >
                            <h3 className="text-xl font-bold mb-2 text-center">Expense Report</h3>
                            <div className="flex flex-col md:flex-row justify-between p-1 ">
                                <div className="w-full md:w-1/2 mb-4 md:mb-0 ">
                                    <h3 className='text-xl font-bold mb-2 border-b'>Selected Month
                                        Expense
                                    </h3>
                                    <div className='md:flex md:w-full '>
                                        <h3 className='text-lg font-bold mb-2 md:w-1/2' >Expense Month</h3>
                                        <span className=' text-lg md:w-1/2'>{SelectedMonthName}</span>
                                    </div>
                                    <div className='md:flex md:w-full '>
                                        <h3 className='text-lg font-bold mb-2 md:w-1/2' >Total Income</h3>
                                        <span className=' text-lg md:w-1/2'>{totalincome}</span>
                                    </div>
                                    <div className='md:flex md:w-full'>
                                        <h3 className='text-lg font-bold mb-2 md:w-1/2' >Saving Amount</h3>
                                        <span className=' text-lg md:w-1/2'>{selectMonthSaving}</span>
                                    </div>
                                    <div className='md:flex md:w-full'>
                                        <h3 className='text-lg font-bold mb-2 md:w-1/2' >Total Budget Amount</h3>
                                        <span className=' text-lg md:w-1/2'>{totalbudgetAmount}</span>
                                    </div>
                                </div>
                                <div className="w-full md:w-1/2 mb-4 md:mb-0 ">
                                    <h3 className='text-xl font-bold mb-2 border-b'>Previous Month
                                        Expense
                                    </h3>

                                    <div className='md:flex md:w-full '>
                                        <h3 className='text-lg font-bold mb-2 md:w-1/2' >Expense Month</h3>
                                        <span className=' text-lg md:w-1/2'>{PreviousMonthName}</span>
                                    </div>
                                    <div className='md:flex md:w-full'>
                                        <h3 className='text-lg font-bold mb-2 md:w-1/2' >Total Amount Amount</h3>
                                        <span className=' text-lg md:w-1/2'>{totalPreviousMonthIncome}</span>
                                    </div>
                                    <div className='md:flex md:w-full '>
                                        <h3 className='text-lg font-bold mb-2 md:w-1/2' >Saving Amount</h3>
                                        <span className=' text-lg md:w-1/2'>{totalPreviousMonthSaving}</span>
                                    </div>
                                </div>

                            </div>
                            {/* <div className='w-full flex flex-col md:flex-row' > */}
                            <div className='w-full flex justify-center items-center ' >
                                <div className='w-full  '>
                                    <aside className='h-80'>

                                        <Pie data={data} />
                                    </aside>
                                </div>
                                {/* <div className='w-full md:w-1/2 '>
                                    <aside className='h-80'>

                                        <Doughnut data={data} />
                                    </aside>
                                </div> */}
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
                                        {
                                            budgetDetails.length > 0 ? (
                                                budgetDetails.map((budget, index) => {
                                                    return (
                                                        <tr key={index}>
                                                            <td className="border px-4 py-2">{index + 1}</td>
                                                            <td className="border px-4 py-2">{budget.categoryName}</td>
                                                            <td className="border px-4 py-2">{budget.Amount}</td>
                                                            <td className="border px-4 py-2">{budget.remainingAmount}</td>
                                                        </tr>
                                                    )
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="border px-4 py-2 text-center">No Data Found</td>
                                                </tr>
                                            )

                                        }
                                    </tbody>
                                </table>
                            </div>
                            <div className='p-2'>
                                <h3 className='text-xl font-bold mb-2 '>Expense Details</h3>
                                <div>
                                    <p>This is short report about Your Monthy Expense</p>
                                    <p>
                                        <span className='font-bold'>Month Name:</span> <span className='font-bold text-green-500'> {SelectedMonthName}</span>
                                    </p>
                                    <p>
                                        <span className='font-bold'>Your Total Income:</span> {totalincome}
                                    </p>
                                    <p>
                                        <span className='font-bold'>Total Budget Amount You Set For Budget:</span> {totalbudgetAmount}
                                    </p>
                                    <p>
                                        <span className='font-bold'>This is the amount that you have designated to save for the current month:</span> {selectMonthSaving}
                                    </p>
                                    <p>
                                        <span className='font-bold'>Total Spend Amount:</span> {totalSpendAmount}
                                    </p>
                                    <p>
                                        <span>
                                            Total Saving amount for this month is <span className='font-bold text-green-500'>{selectMonthSaving}</span> and you have spend <span className='font-bold text-red-500'>{totalSpendAmount}</span> so you have <span className='font-bold text-green-500'>{totalSaving}</span> left for this month
                                        </span>
                                    </p>
                                    <p>
                                        {
                                            totalSaving > totalSpendAmount ? (
                                                <span className='font-bold text-green-500'>You have save more than you spend</span>
                                            )
                                                : (
                                                    <span className='font-bold text-red-500'>You have spend more than you save</span>
                                                )
                                        }
                                    </p>

                                </div>
                            </div>
                            <div className="bg-gray-200 p-3 text-center mt-4">
                               <span className='font-bold text-xl '> Budget Book Report</span>
                            </div>
                        </div>
                    ) : (
                        <ClipLoader
                            color={color}
                            loading={loading}
                            size={150}
                        // aria-label="Loading Spinner"
                        // data-testid="loader"
                        />
                    )
                }
            </main>

        </div>
    )
}

export default Report