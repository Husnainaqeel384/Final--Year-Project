import React from 'react'
import { GiTakeMyMoney  } from 'react-icons/gi';

import { Link } from 'react-router-dom';
const Footer = () => {
  return (
    <>

      <footer className="p-4 bg-blue-100 shadow md:px-6 md:py-8 ">
        <div className="sm:flex sm:items-center sm:justify-between">

          <Link className="flex items-center  mb-4 sm:mb-0">
            <GiTakeMyMoney className="h-8 w-auto sm:h-10 text-indigo-600  "></GiTakeMyMoney>
            <span className="self-center text-2xl p-1 pl-3 font-semibold whitespace-nowrap text-indigo-600 ">Budget-Book</span>
          </Link>
          <ul className="flex flex-wrap items-center mb-6 text-sm sm:mb-0 dark:text-gray-700">
            <li>
              <Link to='/about' className="mr-4 hover:underline md:mr-6  hover:text-indigo-600 ">About</Link>
            </li>
            <li>
              <Link to='/privacy-policy' className="mr-4 hover:underline md:mr-6  hover:text-indigo-600 ">Privacy Policy</Link>
            </li>

            <li>
              <Link to='/contact' className="hover:underline  hover:text-indigo-600 ">Contact</Link>
            </li>
          </ul>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <span className="block text-sm text-gray-900 sm:text-center dark:text-gray-700 font-weight:600">© 2023 Budget Book. All Rights Reserved.
        </span>
      </footer>

    </>
  )
}

export default Footer