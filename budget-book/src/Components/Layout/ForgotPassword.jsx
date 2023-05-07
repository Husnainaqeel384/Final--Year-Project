import React,{useState} from 'react'
import { server } from '../../store'
import axios from 'axios'
import { toast } from 'react-toastify'
const ForgotPassword = () => {
  const [Email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const recoveryPassword = async () => {
    try {
      setIsLoading(true)
      const { data } = await axios.post(`${server}/forgetPassword`, {
        Email
      })
      toast.success(data.message, { position: 'top-center' })
      setEmail('')
      setIsLoading(false)
    } catch (error) {
      toast.error(error.message, { position: 'top-center' })
    }

  }
  return (
    <>
      <div className="relative flex flex-col justify-center h-full mt-20  m-3 sm:m-40">
        <div className="w-92 p-6  sm:m-auto sm:w-96  bg-white rounded-md shadow-xl shadow-rose-600/40  ring-2 ring-purple-600 lg:max-w-xl">
          <h1 className="text-3xl font-semibold text-center text-purple-700  uppercase ">
            Forgot Password
          </h1>
          <div className="mt-6">
            <div className="mb-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-800"
              >
                Please Enter the email to Recover the Password
              </label>
              <input
                type="email"
                required
                onChange={(e) => setEmail(e.target.value)}
                value={Email}
                className="block w-full px-4 py-2 mt-2 text-purple-700 bg-white border rounded-md focus:border-purple-400 focus:ring-purple-300 focus:outline-none focus:ring focus:ring-opacity-40"
              />
            </div>


            <div className="mt-6">
              <button
                onClick={recoveryPassword}
                className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-purple-700 rounded-md hover:bg-purple-600 focus:outline-none focus:bg-purple-600"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Recovery Password"}
              </button>
            </div>
          </div>


        </div>
      </div>
    </>
  )
}

export default ForgotPassword