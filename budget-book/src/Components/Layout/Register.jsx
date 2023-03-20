import React from 'react'
import Header from '../Header/Header'
import { FcGoogle} from 'react-icons/fc'
// import { useState } from 'react'
import { Link } from 'react-router-dom'
const Register = () => {
  return (
    <>
    <Header />  
    <div className="relative flex flex-col justify-center h-full m-10 ">
        <div className="w-92 p-4 sm:m-auto sm:w-96  bg-white rounded-md shadow-xl shadow-rose-600/40 ring ring-2 ring-purple-600 lg:max-w-xl">
            <h1 className="text-3xl font-semibold text-center text-purple-700  uppercase ">
                Sign up
            </h1>
            <form className="mt-3">
            <div className="mb-2">
                    <label
                        htmlFor="fname"
                        className="block text-sm font-semibold text-gray-800"
                    >
                        First Name
                    </label>
                    <input
                        type="text"
                        required
                        className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
                    />
                </div>
                <div className="mb-2">
                    <label
                        htmlFor="lname"
                        className="block text-sm font-semibold text-gray-800"
                    >
                        last Name
                    </label>
                    <input
                        type="text"
                        required
                        className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
                    />
                </div>
                <div className="mb-2">
                    <label
                        htmlFor="username"
                        className="block text-sm font-semibold text-gray-800"
                    >
                        User Name
                    </label>
                    <input
                        type="text"
                        required
                        className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
                    />
                </div>
                <div className="mb-2">
                    <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-gray-800"
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        required
                        className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
                    />
                </div>
                <div className="mb-2">
                    <label
                        htmlFor="password"
                        className="block text-sm font-semibold text-gray-800"
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        required
                        className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
                    />
                </div>

                <div className="mt-6">
                    <button className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:bg-purple-600">
                        Sign Up
                    </button>
                </div>
            </form>
                <hr className='mt-6' />
            <p className="border-solid border-black  border-2 w-10  bg-white m-auto -mt-4 text-xl font-light text-center text-gray-700">
                OR
            </p>
            <Link className=''>
                <FcGoogle className='h-10 w-auto m-auto mt-4 ' />
            </Link>
            <p className="mt-8 text-xs font-light text-center text-gray-700">
                    {" "}
                    Do you have an account?{" "}
                    <a
                        href="/login"
                        className="font-medium text-purple-600 hover:underline"
                    >
                        Sign in
                    </a>
                </p>

        </div>
    </div>
</>
  )
}

export default Register