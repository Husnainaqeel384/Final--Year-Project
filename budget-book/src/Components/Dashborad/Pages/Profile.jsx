import React,{useEffect,useCallback} from 'react'
import { Link } from 'react-router-dom'
import image1 from '../../../images/feature6.png'
import Axios from "axios";
import { server } from '../../../store';
import { useStateContext } from '../../../context/ContextProvider'
const Profile = () => {
const {userProfileId,userProfileFirstName,
  userProfileLastName,userProfileUserName,userProfilemail,
  setUserProfileId,setUserProfileFirstName,setUserProfileLastName
  ,setUserProfileUserName,setUserProfileEmail
} = useStateContext();
const [url,seturl]=React.useState('')
const profileview = useCallback(async () => {
    let token = localStorage.getItem('token')
    const { data } = await Axios.get(`${server}/profile`, {
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
        'authorization':`Bearer ${token}`
      }
    })
    setUserProfileId(data.user.user_id)
    setUserProfileFirstName(data.user.Firstname)
    setUserProfileLastName(data.user.Lastname)
    setUserProfileUserName(data.user.Username)
    setUserProfileEmail(data.user.email)
    seturl(`${server}/user/profile/${data.user.imagepath}`)
    // seturl(`${process.env.REACT_APP_IMAGE_URL}/${data.user.imagepath}`)

  },[setUserProfileId,setUserProfileFirstName,setUserProfileLastName,setUserProfileUserName,setUserProfileEmail,seturl])
  useEffect(() => {
    profileview()
  }, [profileview])
  
  return (
    <>
      {/* <div >Basic Information</div> */}
      <div className=' w-full h-96  mt-14 md:mt-5'>
        <h1 className="mb-4 text-2xl font-extrabold text-gray-900 dark:text-white md:text-xl lg:text-4xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">User Information</span> </h1>
        <div className='md:flex  w-full h-max border border-gray '>
          <div className='md:w-1/4 border-r-1 border-black   '>
            <img src={ url===''? image1:url   } alt="" className='w-52 h-52 mt-12 ml-5  border border-gray rounded-full' />
          </div>
          <div className=' md:w-3/4'>
            <div className='flex gap-5 p-3 w-full '>
              <p className='w-2/6  text-center  bg-gray-100 p-1'>User Id </p>
              <p className='w-4/6 p-1 bg-gray-100' >{userProfileId}</p>
            </div>
            <div className='flex gap-5 p-3 w-full '>
              <p className='w-2/6  text-center  bg-gray-100 p-1'>First Name </p>
              <p className='w-4/6 p-1 bg-gray-100' >{userProfileFirstName}</p>
            </div>
            <div className='flex gap-5 p-3 w-full '>
              <p className='w-2/6  text-center  bg-gray-100 p-1'>Last Name </p>
              <p className='w-4/6 p-1 bg-gray-100 ' >{userProfileLastName}</p>
            </div>
            <div className='flex gap-5 p-3 w-full '>
              <p className='w-2/6  text-center  bg-gray-100 p-1'>User Name </p>
              <p className='w-4/6 p-1 bg-gray-100' >{userProfileUserName}</p>
            </div>
            <div className='flex gap-5 p-3 w-full '>
              <p className='w-2/6  text-center p-1 bg-gray-100'>Email </p>
              <p className='w-4/6 bg-gray-100 p-1 ' >{userProfilemail}</p>
            </div>
            <div className='flex gap-5 p-3 w-full '>
              <Link className='w-3/6  text-center p-1  text-white bg-blue-400 ' to={'/Budget/change-password'} >Change Password</Link>
              <Link className='w-3/6  text-center p-1 text-white bg-blue-400' to={'/Budget/update-user-profile'}>Update Profle </Link>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

export default Profile