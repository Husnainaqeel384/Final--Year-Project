import React, { useState, useEffect } from "react";
import { AiOutlineSearch } from 'react-icons/ai'
import axios from 'axios'
import { server } from '../../../store'
import { toast } from "react-toastify";
const Users = () => {
    const [users, setUsers] = useState([]);
    const [userId, setUserId] = useState("");
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userRole, setUserRole] = useState("");

    const [isEdit, setIsEdit] = useState(false);
    const getUsers = async () => {
        let token = localStorage.getItem('token')
        try {
            const { data } = await axios.get(`${server}/Allusers`, {
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${token}`
                }
            }

            );
            // console.log(data)
            setUsers(data.user);
        } catch (error) {
            toast.error(error.response.data.message, {
                position: toast.POSITION.TOP_CENTER

            })
        }
    }

    useEffect(() => {
        getUsers();
    }, []);
    return (
        <>

            <div className="relative mt-16 md:mt-1 overflow-x-auto shadow-md -z-10 ">
                <div className="ml-16 text-lg ">
                    <h1 className="mb-4 text-3xl  font-extrabold text-gray-900 dark:text-white md:text-4xl lg:text-4xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">All Users</span> </h1>

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
                       {/* {
                            users.map((user, index) => {
                                return (
                                    <tr key={user._id} className="bg-white dark:bg-gray-800">
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <p>{index + 1}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <p>{user._id}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <p>{user.name}</p>
                                            </div>
                                            <div className="flex items-center">
                                                <p>{user.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <p>{user.role}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <p className="text-sm font-medium text-blue-600 cursor-pointer">Edit</p>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                       } */}
                       {

                            users.map((user, index) => {    
                                return (
                                    <tr className="bg-white border-b  hover:bg-gray-50 " key={index}>
                                    <td className="w-4 p-4">
                                        <div className="flex items-center">
                                            <p>{index+1} </p>
                                        </div>
                                    </td>
        
                                    <td className="px-6 py-4">
                                        {user.user_id
                                        
                                    }
                                    </td>
                                    <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
        
                                        <div className="pl-3">
                                            <div className="text-black font-semibold">{user.UserName}</div>
                                            <div className="font-normal text-gray-500">{user.email}</div>
                                        </div>
                                    </th>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-2.5 w-2.5  mr-2"></div> {user.role}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 ">
                                            Edit</button>
                                    </td>
                                </tr>

                                )
                       }    
                          )}

                    </tbody>
                </table>
            </div>

        </>
    )
}


export default Users