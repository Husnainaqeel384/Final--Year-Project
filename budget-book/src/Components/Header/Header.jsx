import React from 'react'
import { Fragment } from 'react'
import { GiReceiveMoney ,GiArchiveRegister } from 'react-icons/gi';
import { SiGnuprivacyguard } from 'react-icons/si';
import { Popover, Transition } from '@headlessui/react'
import {
    Bars3Icon,
    XMarkIcon,
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom';
import '../Styles/header.scss';
const Header = () => {
    return (
        <Popover className="bg-white  drop-shadow h-20  header  sticky top-0 z-50 ">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 ">
                <div className="flex items-center justify-between  border-gray-100 py-6 md:justify-start md:space-x-10">
                    <div className="flex justify-start lg:w-0 lg:flex-1">
                        <Link >
                            <span className="sr-only">Budget-Book</span>
                            <GiReceiveMoney className="h-8 w-auto sm:h-10 text-sky-600"></GiReceiveMoney>
                        </Link>
                        <Link to="/" className='flex items-center justify-center pl-5 font-bold text-2xl'>Budget-Book</Link>
                    </div>
                    <div className="-my-2 -mr-2 md:hidden">
                        <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                            <span className="sr-only">Open menu</span>
                            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                        </Popover.Button>
                    </div>

                    <div className="hidden items-center justify-end md:flex md:flex-1 lg:w-0">
                         <SiGnuprivacyguard className='mr-2  h-8 w-auto text-sky-600 '></SiGnuprivacyguard> 
                        <Link to="/login" className="whitespace-nowrap text-base font-medium  bg-transparent border border-blue-500 text-blue-500    hover:bg-blue-500 hover:text-white text-center py-2 px-4 rounded">
                            Sign in
                        </Link>
                        <GiArchiveRegister className='ml-4 h-8 w-auto  mr-0 w-30 text-sky-600 '></GiArchiveRegister> 
                        <Link
                            to="/register"
                            className="ml-3 inline-flex items-center justify-center whitespace-nowrap rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                        >
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>

            <Transition
                as={Fragment}
                enter="duration-200 ease-out"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="duration-100 ease-in"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <Popover.Panel focus className="absolute inset-x-0 top-0 origin-top-right transform p-2 transition md:hidden">
                    <div className="divide-y-2 divide-gray-50 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="px-5 pt-5 pb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center justify-between">
                                    <GiReceiveMoney className="h-8 w-auto sm:h-10 text-sky-600"></GiReceiveMoney>
                                    <h1 className='flex items-center justify-center pl-5 font-bold text-2xl'>Budget-Book</h1>
                                </div>
                                <div className="-mr-2">
                                    <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                                        <span className="sr-only">Close menu</span>
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </Popover.Button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6 py-6 px-5">

                            <div>
                                <Link
                                    to="/register"
                                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                                >
                                    Sign up
                                </Link>
                                <p className="mt-6 text-center text-base font-medium text-gray-500">
                                    Existing Account?{' '}
                                    <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </Popover.Panel>
            </Transition>
        </Popover>
    )
}

export default Header