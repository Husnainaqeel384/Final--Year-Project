import React from "react";
import { AiOutlineSearch } from 'react-icons/ai'
const Users = () => {
    return (
        <>

            <div className="relative mt-16 md:mt-1 overflow-x-auto shadow-md -z-10 ">
                <div className="ml-16 text-lg ">
                    <h1 className="mb-4 text-3xl  font-extrabold text-gray-900 dark:text-white md:text-4xl lg:text-4xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">All Users</span> </h1>

                </div>

                <div className="flex items-center justify-between pt-3 pb-4 bg-white  " >
                    <label htmlFor="table-search" className="sr-only">Search</label>
                    <div className="relative ">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3  pointer-events-none">
                            <AiOutlineSearch className="text-white " />
                        </div>
                        <input type="text" id="table-search-users" class="block p-2 pl-10 text-sm  text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search for users" />
                    </div>
                </div>
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="p-4">
                                <div className="flex items-center">
                                    <p>SR.No</p>
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-3">
                                User ID
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Name & Email
                            </th>

                            <th scope="col" className="px-6 py-3">
                                Role
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-white border-b  hover:bg-gray-50 ">
                            <td className="w-4 p-4">
                                <div className="flex items-center">
                                    <p>1</p>
                                </div>
                            </td>

                            <td className="px-6 py-4">
                                {12345}
                            </td>
                            <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">

                                <div className="pl-3">
                                    <div className="text-black font-semibold">Husnain</div>
                                    <div className="font-normal text-gray-500">Husnainaqeel384@gmail.com</div>
                                </div>
                            </th>
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="h-2.5 w-2.5  mr-2"></div> Admin
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 ">
                                    Edit</button>
                            </td>
                        </tr>


                    </tbody>
                </table>
            </div>

        </>
    )
}


export default Users