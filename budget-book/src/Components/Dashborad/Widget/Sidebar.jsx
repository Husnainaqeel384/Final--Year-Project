import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { MdOutlineCancel } from 'react-icons/md';
import { GiReceiveMoney } from 'react-icons/gi';
// import { MdKeyboardArrowDown } from 'react-icons/md'
import { links } from '../../data/sidebarlinks';
import { useStateContext } from '../../../context/ContextProvider';
const Sidebar = () => {
  const [userIsAdmin , setuserIsAdmin]=useState(false)
  const { activeMenu, setactiveMenu, screenSize } = useStateContext();
  const hanldeCloseSideBar = () => {
    if (activeMenu && screenSize <= 900) {
      setactiveMenu(false)
    }
  }
  const activeLink = 'flex items-center gap-4 pl-4 pt-2 pb-2 rounded-lg bg-blue-400 text-white  text-md m-2';
  const normalLink = 'flex items-center gap-5 pl-4 pt-2 pb-2 rounded-lg text-lg text-gray-700 dark:text-gray-600 dark:hover:text-black hover:bg-gray-200 m-2';
  return (
    <>
      <div className='ml-3 h-screen md:overflow-hiden overflow-auto  md:hover:overflow-auto pb-10'>
        {activeMenu && (<>
          <div className='flex justify-between items-center'>
            <Link to="/Budget" onClick={hanldeCloseSideBar}
              className="items-center gap-3 ml-3 mt-4 flex text-xl font-extrabold tracking-tight text-blue-700"
            > <GiReceiveMoney /><span>Budget-Book</span>
            </Link>
            <button
              type="button"
              onClick={() => setactiveMenu(
                (prevActiveMenu) => !prevActiveMenu
              )}
              className="text-xl rounded-full p-3 hover:bg-light-gray mt-4 block md:hidden"
            >
              <MdOutlineCancel />
            </button>
          </div>
          <div className='mt-7'>
            {
              <div >
                {links.map((link) => (
                  (userIsAdmin || !link.isAdminOnly) &&
                  <NavLink
                    to={`/${link.path}`}
                    key={link.name}
                    onClick={hanldeCloseSideBar}
                    className={({ isActive }) => isActive ? activeLink : normalLink}
                  >
                    {link.icon}
                    <span className='cpaitalize'>
                      {link.name}
                    </span>
                  </NavLink>
                ))
                }
              </div>
            }
          </div>
        </>)}
      </div>
    </>
  )
}

export default Sidebar