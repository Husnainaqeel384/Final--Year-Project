import React from 'react'
// import { Link } from 'react-router-dom';
// import feature1 from '../../images/feature1.png'
// import feature2 from '../../images/feature2.png'
// import feature3 from '../../images/feature3.jpeg'
// import feature4 from '../../images/feature4.png'
// import feature5 from '../../images/feature5.png'
// import feature6 from '../../images/feature6.png'
// import feature7 from '../../images/feature7.jpeg'
import '../Styles/features.scss';
const Features = () => {
    return (
        <>
            <section className=' feature' >
                <main className='featureMain'>
                    <div className='featurefirstdiv flex  flex-col sm:flex sm:justify-center sm:items-center sm:p-8'>
                        <h1 className='text-4xl  leading-10 text-center p-5 font-bold'>Good Bye, Money stress.Hello Budget Makers</h1>
                        <h6 className='text-center italic text-green-900 p-3 sm:p-2'>Budgetbook comes with all the feature to start budgeting from right way</h6>
                        {/* <Link className='text-white font-bold ml-14 flex justify-center items-center mt-8  rounded-lg hover:-translate-y-1 hover:scale-110 bg-indigo-500 duration-300 hover:text-white hover:font-bold hover:shadow-[0_4px_0px_rgb(0,0,0)] 
                            sm:-ml-8 sm:mt-2 '>See What's New</Link> */}
                            <h2 className='text-3xl pt-6 font-bold text-indigo-600 text-center'>Features</h2>
                    </div>
                    <div className=' max-h-min flex flex-wrap justify-center w-full gap-5  p-4 '>
                        <div className=' md:w-1/4  rounded-3xl box-shadows border-indigo-600 p-6 bg-blue-100 '>
                            <h1 className=' font-medium text-center text-lg featureDiv mt-3 '>Monthly Budget</h1>
                            <p className=' text-xs text-center p-2 '>
                                The monthly budget feature allows users to track their income and expenses, providing a clear overview of their financial situation and helping them make informed spending decisions.
                            </p>
                        </div>
                        <div className='md:w-1/4 rounded-3xl box-shadows border-indigo-600 p-6 bg-blue-100'>
                            <h1 className=' font-medium text-center text-lg featureDiv mt-3 '>Categories</h1>
                            <p className=' text-xs text-center p-2 '>
                                The budget book includes categories such as income, Fuel, transportation, groceries,  entertainment, and savings, allowing users to organize and track their expenses effectively for better financial planning.
                            </p>
                        </div>
                        <div className='md:w-1/4 rounded-3xl box-shadows border-indigo-600 p-6 bg-blue-100'>
                            <h1 className=' font-medium text-center text-lg featureDiv mt-3'>Reminders</h1>
                            <p className=' text-xs text-center p-2 '>
                                The reminders feature in a budget book displays notification to users for upcoming bill payments and important financial deadlines, helping them stay organized and avoid late payments or missed opportunities.
                            </p>
                        </div>
                        <div className='md:w-1/4 rounded-3xl box-shadows border-indigo-600 p-6 bg-blue-100'>
                            <h1 className=' font-medium text-center text-lg featureDiv mt-3'>Notes</h1>
                            <p className=' text-xs text-center p-2 '>
                                The notes feature in a budget management system allows users to add personalized memos or descriptions to specific transactions, helping them remember important details or categorize expenses more effectively for future reference and analysis.
                            </p>
                        </div>
                        <div className='md:w-1/4 rounded-3xl box-shadows border-indigo-600 p-6 bg-blue-100'>
                            <h1 className=' font-medium text-center text-lg featureDiv mt-3'>Split Bill</h1>
                            <p className=' text-xs text-center p-2 '>
                                The split bills feature in a budget book allows users to divide shared expenses among multiple participants, accurately tracking each person's contribution and simplifying the process of settling bills within a group, such as roommates, friends, or colleagues.
                            </p>
                        </div>
                        <div className='md:w-1/4 rounded-3xl box-shadows border-indigo-600 p-6 bg-blue-100'>
                            <h1 className=' font-medium text-center text-lg featureDiv mt-3'>Forecasting</h1>
                            <p className=' text-xs text-center p-2 '>
                                Forecasting in a budget book uses historical financial data and trends to project future income, expenses, and savings, enabling users to anticipate their financial situation and make proactive decisions for better financial planning.
                            </p>
                        </div>
                    </div>
                    {/* <div className='featureseconddiv flex  flex-col sm:flex sm:flex-row sm=w-11/12  sm:h-full sm:mt-14'>
                        <div className='sm:w-3/5 sm:ml-10'>
                            <img src={feature2} className="image1 sm:-mt-4 sm:-ml-7 " alt="" />
                            <img src={feature1} alt="" className="image2   " />
                            <img src={feature2} className="image3 sm:ml-14 sm:-mt-9 " alt="" />
                            <img src={feature3} className="image4 sm:-mt-5 sm:-ml-2  " alt="" />
                        </div>
                        <div className='sm:w-2/5 sm:flex sm:justify-center sm:items-center '>
                            <img src={feature4} className="image5  w-72 h-64 sm:-mt-5 sm:ml-22 sm:w-80 sm:h-auto " alt="" />
                            <h3 className='sm:-mt-18 sm:ml-18'>Personalize Your Budget</h3>
                            <h4 className='sm:-mt-18 sm:ml-18'>Organize everything in a way
                                that works better for you</h4>
                        </div>

                    </div>
                    <div className='featurethirddiv  flex flex-col sm:mt-20  sm:flex sm:flex-row sm=w-11/12  sm:h-full '>
                        <div className=' relative sm:w-3/5 sm:flex sm:justify-center sm:items-center '>
                            <img src={feature5} className=" absolute w-64 ml-20 sm:w-80 sm:mt-[35rem] sm:-ml-20 sm:max-w-xs sm:h-auto" alt="" />
                            <h3 className='text-center  mt-10 sm:mt-52 sm:ml-20 sm:text-sx '>Set up Saving Funds</h3>
                            <h4 className=' text-center sm:mt-44 sm:ml-20'>You can Plan ahead for
                                big purhases by saving goals</h4>
                        </div>

                        <div className='sm:w-2/5 sm:ml-10'>
                            <img src={feature6} alt="" className=" absolute w-80 ml-9 h-80 mt-64 sm:mt-14 sm:h-96 sm:w-92 " />
                            <img src={feature7} className=" absolute w-60 h-64 ml-20 mt-72 sm:mt-24 sm:ml-14 sm:h-80 sm:w-72 " alt="" />
                        </div>

                    </div> */}
                </main>
            </section>
        </>
    )
}

export default Features