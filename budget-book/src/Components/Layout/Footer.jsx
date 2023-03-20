import React from 'react'
import { GiReceiveMoney, } from 'react-icons/gi';
import { Link } from 'react-router-dom';
const Footer = () => {
  return (
    <>

      <footer className="p-4 bg-white  shadow md:px-6 md:py-8 dark:bg-gray-900">
        <div className="sm:flex sm:items-center sm:justify-between">

          <Link className="flex items-center  mb-4 sm:mb-0">
            <GiReceiveMoney className="h-8 w-auto sm:h-10 text-sky-600 "></GiReceiveMoney>
            <span className="self-center text-2xl p-1 pl-3 font-semibold whitespace-nowrap dark:text-white">Budget-Book</span>
          </Link>
          <ul className="flex flex-wrap items-center mb-6 text-sm text-gray-500 sm:mb-0 dark:text-gray-400">
            <li>
              <Link className="mr-4 hover:underline md:mr-6 ">About</Link>
            </li>
            <li>
              <Link className="mr-4 hover:underline md:mr-6">Privacy Policy</Link>
            </li>

            <li>
              <Link className="hover:underline">Contact</Link>
            </li>
          </ul>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2022 Budget Book. All Rights Reserved.
        </span>
      </footer>

    </>
  )
}

export default Footer