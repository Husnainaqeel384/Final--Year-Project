import React, { useState, useEffect } from 'react'
import { useStateContext } from '../../../context/ContextProvider'
import Axios from "axios";
import { server } from '../../../store';
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
const UpdateUserProfile = () => {
  const navigate = useNavigate()
  const { userProfileId, userProfileFirstName,
    userProfileLastName, userProfileUserName, userProfilemail,
    setUserProfileId, setUserProfileFirstName, setUserProfileLastName
    , setUserProfileUserName, setUserProfileEmail
  } = useStateContext();
  const [filename, setFilename] = useState('Choose File')
  const profileview = async () => {
    let token = localStorage.getItem('token')
    const { data } = await Axios.get(`${server}/profile`, {
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
        'authorization': `Bearer ${token}`
      }
    })
    setUserProfileId(data.user.user_id)
    setUserProfileFirstName(data.user.Firstname)
    setUserProfileLastName(data.user.Lastname)
    setUserProfileUserName(data.user.Username)
    setUserProfileEmail(data.user.email)
  }
  const saveFile = async () => {
    console.log(filename)
    // try {
    //   let token = localStorage.getItem('token')
    //   const { data } = await Axios.post(`${server}/upload`, {
    //     headers: {
    //       'Accept': 'application/json',
    //       'Content-type': 'application/json',
    //       'authorization': `Bearer ${token}`
    //     }
    //   })
    //   console.log(data)
    // } catch (error) {
    //   console.log(error.response.data.message)
    // }
  }

  useEffect(() => {
    profileview()
  }, [])

  const updateProfile = async () => {
    try {
      let token = localStorage.getItem('token')
      const { data } = await Axios.post(`${server}/update-user-Profile`,
        {
          fname: userProfileFirstName,
          lname: userProfileLastName,
          username: userProfileUserName,
          Email: userProfilemail,
        }, {
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json',
          'authorization': `Bearer ${token}`
        }
      })
      navigate('/Budget/User-profile')
      toast.success(data.message)

    } catch (error) {
      console.log(error.response.data.message)
    }

  }


  return (
    <>
      <div className='md:m-0 mt-14'>
        <h1 className="mb-4 text-2xl md:text-center font-extrabold text-gray-900 dark:text-white md:text-xl lg:text-4xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">Update Profile</span> </h1>
        <div className='md:flex  w-full h-max border border-gray '>
          <div className='md:w-2/6 border-r-2 border-black   '>
            <h1 className='w-full p-3 bg-blue-400 text-white'>Change Profile Picture</h1>
            <input type="file" name="" id=""  className='w-full mt-14' onChange={(e)=>setFilename(e.target.files[0])} />
            <button onClick={saveFile} 
            className='w-40 mt-40 rounded ml-12 bg-blue-600 p-2 text-white'>Change Pciture</button>
          </div>
          <div className=' md:w-4/6 md:ml-5'>
            <div className='flex gap-5 p-3 w-full '>
              <p className='md:w-2/6 w-3/6 text-center  bg-gray-100 p-1'>User Id </p>
              <input type="text" className='w-3/6 p-1 bg-gray-100' value={userProfileId} readOnly />

            </div>
            <div className='flex gap-5 p-3 w-full '>
              <p className='w-2/6  text-center  bg-gray-100 p-1'>First Name </p>
              <input type="text" name="" id="" className='w-4/6 p-1 bg-gray-100 ' value={userProfileFirstName} onChange={(e) => setUserProfileFirstName(e.target.value)} />
            </div>
            <div className='flex gap-5 p-3 w-full '>
              <p className='w-2/6  text-center  bg-gray-100 p-1'>Last Name </p>
              <input type="text" name="" id="" className='w-4/6 p-1 bg-gray-100' value={userProfileLastName} onChange={(e) => setUserProfileLastName(e.target.value)} />

            </div>
            <div className='flex gap-5 p-3 w-full '>
              <p className='w-2/6  text-center  bg-gray-100 p-1'>User Name </p>
              <input type="text" name="" id="" className='w-4/6 p-1 bg-gray-100' value={userProfileUserName} onChange={(e) => setUserProfileUserName(e.target.value)} />

            </div>
            <div className='flex gap-5 p-3 w-full '>
              <p className='w-2/6  text-center p-1 bg-gray-100'>Email </p>
              <input type="email" name="" id="" className='w-4/6 p-1 bg-gray-100' value={userProfilemail} onChange={(e) => setUserProfileEmail(e.target.value)} />

            </div>
            <div className='flex gap-5 p-3 w-full '>
              <button className='w-3/6  p-1 m-auto text-white bg-blue-400 ' onClick={updateProfile} >Update Profile</button>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default UpdateUserProfile