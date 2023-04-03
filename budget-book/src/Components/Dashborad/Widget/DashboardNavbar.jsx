import React, { useEffect, useState } from 'react'
import { AiOutlineMenu } from 'react-icons/ai'
import { MdKeyboardArrowDown } from 'react-icons/md'
import {  useSelector } from "react-redux"

import { Link } from 'react-router-dom'
import { useStateContext } from '../../../context/ContextProvider'
import image1 from '../../../images/feature6.png'
import { useNavigate } from 'react-router-dom'

const DropdownMenu=()=>{
  const navigate = useNavigate()
  const {
   opendrop,setOpenDrop } = useStateContext();
   const logoutbtn=()=>{
    localStorage.removeItem('token')
    navigate('/login')
   }
  return(
    <>
    <div className='flex flex-col absolute top-16 p-6 w-28  bg-white border border-gray shadow-lg  rounded-xl   '>
      <ul className='flex flex-col gap-4 w-full'>
        <Link to={'/Budget/User-profile'} onClick={()=>{setOpenDrop(!opendrop)}} >Profile</Link>
        <li  onClick={logoutbtn} className='cursor-pointer'  >Logout</li>
      </ul>
    </div>
    </>)
};

const NavButton = ({ customFunc, icon, }) => (
  <button
    type="button"
    onClick={() => customFunc()}
    className="relative text-xl rounded-full p-3 hover:bg-light-gray "
  >
    <span className="absolute inline-flex rounded-full h-2 w-2 right-2 top-2" />
    {icon}
  </button>);

const DashboardNavbar = ({username,url}) => {
  // const [name,setName]=useState('')
  // const { user } = useSelector(state => state.user)
 
  const {
    //  activeMenu,
      setactiveMenu,  screenSize, 
      // setIsClicked,
       setScreenSize, opendrop,setOpenDrop } = useStateContext();
//  useEffect(()=>{
//   setName(user.UserName)
//  },[setName],[])
  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener('resize', handleResize())
    handleResize();
    return () => window.removeEventListener('resize', handleResize())
  }, [])

  useEffect(() => {
    if (screenSize <= 900) {
      setactiveMenu(false)
    } else {
      setactiveMenu(true)
    }
  }, [screenSize])


  return (
    <div className='flex justify-between p-2 md:mx-6 relative' >
      <NavButton title='Menu' customFunc={() => setactiveMenu((preActiveMenu) => !preActiveMenu)}
        icon={<AiOutlineMenu />}
      />
      <div className='flex'>
        <div className='flex items-center cursor-pointer p-1 hover:bg-light-gray rounded-lg '
          onClick={() => setOpenDrop(!opendrop)}
        >
          <img src={url==='' ?image1:url } className="rounded-full w-8 h-8" alt="" />
          <p>
            {/* <span className='text-gray-400 text-14'> Hi, </span>{' '} */}
            <span className='text-gray-400 font-bold ml-1 text-14'>{username}</span>
          </p>
          <MdKeyboardArrowDown className='text-gray-400 text-14' />
          {/* {isClicked.userProfile && <Profile />} */}
        </div>
        {
          opendrop && ( <DropdownMenu />)
        }
       
      </div>

    </div>
  )
}

export default DashboardNavbar


