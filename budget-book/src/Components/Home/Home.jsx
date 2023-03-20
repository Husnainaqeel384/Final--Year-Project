import React from 'react'
import '../Styles/home.css'
import HomeImgae from '../../images/HomeSectionovebg.png'
import { Link } from 'react-router-dom'
import Features from '../Layout/Features'
import Footer from '../Layout/Footer'
import Header from '../Header/Header'
// import Sample from '../Sample'

const Home = () => {
    return (
        <>
        <Header />
        <section className='bg-teal-300 homesection  '  >
        <main
            className='flex flex-col-reverse  sm:flex-row sm:justify-between mainhome'>
            <div className='flex flex-col sm:w-2/5  sm:justify-center sm:items-center' >
                <p className='w-72 p-6 ml-12 text-2xl flex justify-center items-center sectionpara sm:m-0 sm:text-4xl 
             sm:w-96 sm:p-8 sm:text-center sm:leading-tigh sm:-mt-8
            '>
                    {/* Manage Budget  Easily & Tell your  Money Where  to go */}
                    Manage Your Finances Easily & Effectively - With Our Budget Management System!
                </p>
                <h6
                    className='ml-16 text-sm w-64 p-1 italic text-green-900 font-bold 
            sm:m-0  sm:w-96 sm:mt-4
            '
                >
                    A budget doesn't limit your freedom; it give you freedom
                </h6>
                <Link to='/login' className='text-blue-800 font-bold bg-white w-52 text-center ml-20 mt-8 p-2 rounded-lg hover:-translate-y-1 hover:scale-110 hover:bg-indigo-500 duration-300 hover:text-white hover:font-bold hover:shadow-[0_4px_0px_rgb(0,0,0)] 
                sm:-ml-9
                '>
                    Start Budgeting For Free
                </Link>

            </div>
            <div className='flex justify-center items-center ml-5 w-84 mt-5 '>
                <img src={HomeImgae} alt="" />
            </div>
        </main>
    </section>
    <Features />
    <Footer />
    {/* <Sample /> */}
        </>
        
    )
}

export default Home