import React from 'react'
import Header from '../Header/Header'
import { useDispatch, useSelector } from "react-redux"
import { FcGoogle } from 'react-icons/fc'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { LoginUser } from '../../redux/actions/user.js'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
const Login = () => {
    const { message, error, token } = useSelector(state => state.user)
    const [Email, setEmail] = useState('')
    const [Password, setPassword] = useState('');
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const submitHandler = async (e) => {
        e.preventDefault();
        dispatch(LoginUser(Email, Password))

    }
    useEffect(() => {
        if (error) {
            toast.error(error)
        }
        dispatch({ type: "clearError" })
        if (message) {
            toast.success(message)
            // localStorage.setItem('token',token)
            navigate('/Budget')
        }
        dispatch({ type: "clearMessage" })
    }, [dispatch, error, message, token, navigate])

    return (
        <>
            <Header />
            <div className="relative flex flex-col justify-center h-full m-10 ">
                <div className="w-92 p-6  sm:m-auto sm:w-96  bg-white rounded-md shadow-xl shadow-rose-600/40  ring-2 ring-indigo-600 lg:max-w-xl">
                    <h1 className="text-3xl font-semibold text-center text-indigo-600  uppercase ">
                        Sign in
                    </h1>
                    <form className="mt-6" onSubmit={submitHandler}>
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
                                value={Email}
                                className="block w-full px-4 py-2 mt-2 text-indigo-600 bg-white border rounded-md focus:border-indigo-600 focus:ring-indigo-300 focus:outline-none focus:ring focus:ring-opacity-40"
                                onChange={(e) => { setEmail(e.target.value) }}
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
                                value={Password}
                                className="block w-full px-4 py-2 mt-2 text-indigo-600 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
                                onChange={(e) => { setPassword(e.target.value) }}
                            />
                        </div>

                        <div className="mt-6">
                            <button type='submit' className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-indigo-600 rounded-md hover:bg-indigo-800 focus:outline-none focus:bg-indigo-700">
                                Login
                            </button>
                            <Link
                                to="/forgot-password"
                                className="text-xs text-indigo hover:underline"
                            >
                                Forget Password?
                            </Link>
                        </div>
                    </form>
                    {/* <hr className='mt-6' />
                    <p className="border-solid border-black  border-2 w-10  bg-white m-auto -mt-4 text-xl font-light text-center text-gray-700">
                        OR
                    </p>
                    <Link className=''>
                        <FcGoogle className='h-10 w-auto m-auto mt-4 ' />
                    </Link> */}
                    <p className="mt-8 text-xs font-light text-center text-gray-700">
                        {" "}
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="font-medium text-blue-600 hover:underline"
                        >
                            Sign up
                        </Link>
                    </p>

                </div>
            </div>
        </>
    )
}

export default Login
