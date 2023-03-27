import React, { useState } from 'react'
import Header from '../Header/Header'
import { FcGoogle } from 'react-icons/fc'
import { server } from '../../store'
import { toast } from 'react-toastify';
import axios from 'axios';
import { Link,useNavigate } from 'react-router-dom'
const Register = () => {
    const navigate = useNavigate()
    const [fname, setFname] = useState('')
    const [lname, setLname] = useState('')
    const [username, setUsername] = useState('')
    const [Email, setEmail] = useState('')
    const [Password, setPassword] = useState('')
    // const [error, setError] = useState('')

    const handleSubmit = async () => {
        if (fname === '' || lname === '' || username === '' || Email === '' || Password === '') {

            toast.error("Please Fill All Fields", {
                position: toast.POSITION.TOP_CENTER
            })
            // setError('Please Fill All Fields')
            // setTimeout(() => {
            //     setError('')
            // }, 3000);

            // return
        } else if (Password.length < 6) {
            toast.error("Password must be at least 6 characters", {
                position: toast.POSITION.TOP_CENTER
            })
        } else {
            try {

                const { data } = await axios.post(`${server}/register`, {
                    fname,
                    lname,
                    Email,
                    username,
                    Password
                })
                setFname('')
                setLname('')
                setUsername('')
                setEmail('')
                setPassword('')
                navigate('/login')
                toast.success(data.message, {
                    position: toast.POSITION.TOP_CENTER
                })
              
            }
            catch (error) {
                toast.error(error.response.data.message, {
                    position: toast.POSITION.TOP_CENTER
                })
            }
        }

    }

    return (
        <>
            <Header />
            {/* {
                error && <div className=" mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error! </strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            } */}
            {/* {
            success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline">{success}</span>
            </div>
        } */}
            <div className="relative flex flex-col justify-center h-full m-10 ">
                <div className="w-92 p-4 sm:m-auto sm:w-96  bg-white rounded-md shadow-xl shadow-rose-600/40  ring-2 ring-purple-600 lg:max-w-xl">
                    <h1 className="text-3xl font-semibold text-center text-purple-700  uppercase ">
                        Sign up
                    </h1>
                    <div className="mt-3" >
                        <div className="mb-2">
                            <label
                                htmlFor="fname"
                                className="block text-sm font-semibold text-gray-800"
                            >
                                First Name
                            </label>
                            <input
                                type="text"

                                value={fname}
                                onChange={(e) => setFname(e.target.value)}
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

                                value={lname}
                                onChange={(e) => setLname(e.target.value)}
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

                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
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

                                value={Email}
                                onChange={(e) => setEmail(e.target.value)}
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

                                value={Password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
                            />
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={handleSubmit}
                                className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:bg-purple-600">
                                Sign Up
                            </button>
                        </div>
                    </div>
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