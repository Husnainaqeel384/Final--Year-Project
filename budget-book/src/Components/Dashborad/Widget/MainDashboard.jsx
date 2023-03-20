import React from 'react'
import { GiReceiveMoney } from 'react-icons/gi';
const MainDashboard = () => {
    return (
        <>
            <div className='mt-16 md:m-0 lg:m-0'>
            <h1 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white md:text-2xl lg:text-4xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">DASHBOARD</span> </h1>
                <div className='flex flex-wrap lg:flex-nowrap justify-center'>
                    {/* <div className="bg-white dark:text-gray-600 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3 bg-hero-pattern bg-no-repeat bg-cover bg-center"> */}
                    <div className="flex m-3 flex-wrap justify-center gap-1 items-center navbarshadow ">
                        <div className="bg-white h-40 dark:text-gray-600 dark:bg-secondary-dark-bg md:w-44  p-4 pt-7 rounded-2xl ">
                            <button
                                type="button"
                                // style={{ color: item.iconColor, backgroundColor: item.iconBg }}
                                className="text-2xl opacity-0.9 rounded-full  p-3 hover:drop-shadow-xl"
                            >
                                {/* {item.icon} */} <GiReceiveMoney />
                    
                            </button>
                            <p className="text-lg text-gray-600  mt-1">TOTAL BUDGETS</p>
                            <p className="mt-2 text-center">
                                <span className="text-lg font-bold ">
                                    {/* {item.amount} */}0
                                </span>
                            </p>

                        </div>
                        {/* ))} */}
                    </div>
                    <div className="flex m-3 flex-wrap justify-center gap-1 items-center navbarshadow ">
                        <div className="bg-white h-40 dark:text-gray-600 dark:bg-secondary-dark-bg md:w-44  p-4 pt-7 rounded-2xl ">
                            <button
                                type="button"
                                // style={{ color: item.iconColor, backgroundColor: item.iconBg }}
                                className="text-2xl opacity-0.9 rounded-full  p-3 hover:drop-shadow-xl"
                            >
                                {/* {item.icon} */} <GiReceiveMoney />
                    
                            </button>
                            <p className="text-lg text-gray-600  mt-1">THIS MONTH</p>
                            <p className="mt-2 text-center">
                                <span className="text-lg font-bold ">
                                    {/* {item.amount} */}0
                                </span>
                            </p>

                        </div>
                        {/* ))} */}
                    </div>
                    <div className="flex m-3 flex-wrap justify-center gap-1 items-center navbarshadow ">
                        <div className="bg-white h-40 dark:text-gray-600 dark:bg-secondary-dark-bg md:w-44  p-4 pt-7 rounded-2xl ">
                            <button
                                type="button"
                                // style={{ color: item.iconColor, backgroundColor: item.iconBg }}
                                className="text-2xl opacity-0.9 rounded-full  p-3 hover:drop-shadow-xl"
                            >
                                {/* {item.icon} */} <GiReceiveMoney />
                    
                            </button>
                            <p className="text-lg text-gray-600  mt-1">EXPENSES</p>
                            <p className="mt-2 text-center">
                                <span className="text-lg font-bold ">
                                    {/* {item.amount} */}0
                                </span>
                            </p>

                        </div>
                        {/* ))} */}
                    </div>
                    <div className="flex m-3 flex-wrap justify-center gap-1 items-center navbarshadow ">
                        <div className="bg-white h-40 dark:text-gray-600 dark:bg-secondary-dark-bg md:w-44  p-4 pt-7 rounded-2xl ">
                            <button
                                type="button"
                                // style={{ color: item.iconColor, backgroundColor: item.iconBg }}
                                className="text-2xl opacity-0.9 rounded-full  p-3 hover:drop-shadow-xl"
                            >
                                {/* {item.icon} */} <GiReceiveMoney />
                    
                            </button>
                            <p className="text-lg text-gray-600  mt-1">TOTAL BUDGETS</p>
                            <p className="mt-2 text-center">
                                <span className="text-lg font-bold ">
                                    {/* {item.amount} */}0
                                </span>
                            </p>

                        </div>
                        {/* ))} */}
                    </div>
                 

                    {/* </div> */}
                </div>

            </div>
        </> 
    )
}

export default MainDashboard