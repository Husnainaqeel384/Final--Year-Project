import React, { useState, useEffect } from 'react'
import { RiDeleteBin6Line } from 'react-icons/ri'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import { GrView } from 'react-icons/gr'
import { toast } from 'react-toastify';
import { server } from '../../../store';
import { Link } from 'react-router-dom'
import axios from 'axios'
const BillSplitterer = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [memberName, setMemberName] = useState('')
    const [GroupName, setGroupName] = useState('')
    const [members, setMembers] = useState([])
    const [memberList, setMemberList] = useState([])
    const [group, setGroup] = useState([])
    const AddMembersInArray = (name) => {
        if (name !== '') {
            const uniqueMember = members.find(member => member.MemberName === name)
            if (uniqueMember) {
                toast.error('Member already exists', {
                    position: "top-center",
                    autoClose: 2000
                })
            }
            else {
                setMembers([...members, { MemberName: name }])
                setMemberName('')
                console.log(members)
            }
        } else {
            toast.error('Please enter name', {
                position: "top-center",
                autoClose: 2000
            })
        }
    }
    const deletemeber = (index) => {
        const newMembers = members.filter((member, i) => i !== index)
        setMembers(newMembers)
    }
    const addMembers = async () => {
        try {
            const token = localStorage.getItem('token')
            const { data } = await axios.post(`${server}/AddMembers`, {
                memberName
            },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`

                    }
                })
            toast.success(data.message, {
                position: "top-center",
                autoClose: 2000
            })
            setIsOpen(!isOpen)
            setMemberName('')
            MemberLists()
        } catch (error) {

            toast.error(error.response.data.message, {
                position: "top-center",
                autoClose: 2000
            })
        }
    }

    const createGroup = async () => {
        try {
            const token = localStorage.getItem('token')
            if (GroupName === '') {
                toast.error('Please enter group name', {
                    position: "top-center",
                    autoClose: 2000
                })
                return
            }
            if (members.length === 0) {
                toast.error('Please add one members Atleast', {
                    position: "top-center",
                    autoClose: 2000
                })
                return
            }
            const { data } = await axios.post(`${server}/createGroup`, {
                GroupName, members
            },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
            toast.success(data.message, {
                position: "top-center",
                autoClose: 2000
            })
            setMembers([])
            setGroupName('')
            viewGroup()

        } catch (error) {
            toast.error(error.response.data.message, {
                position: "top-center",
                // autoClose: 2000
            })
        }

    }


    const viewGroup = async () => {
        try {
            const token = localStorage.getItem('token')
            const { data } = await axios.get(`${server}/AllGroups`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            setGroup(data.AllGroups)
        } catch (error) {
            toast.error(error.response.data.message, {
                position: "top-center",
                // autoClose: 2000
            })
        }
    }
    const deleteGroup = async (id) => {
        try {
            const token = localStorage.getItem('token')
            const { data } = await axios.delete(`${server}/deleteGroup/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            toast.success(data.message, {
                position: "top-center",
                autoClose: 2000
            })
            viewGroup()

        } catch (error) {
            toast.error(error.response.data.message, {
                position: "top-center",
                // autoClose: 2000
            })
        }
    }
    const MemberLists = async () => {
        try {
            const token = localStorage.getItem('token')
            const { data } = await axios.get(`${server}/getMembersList`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            setMemberList(data.getMembersList)


        } catch (error) {
            toast.error(error.response.data.message, {
                position: "top-center",
                // autoClose: 2000
            })
        }
    }
const deleteMember = async (id) => {
    try {
        const token = localStorage.getItem('token')
        const { data } = await axios.delete(`${server}/deleteMember/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        toast.success(data.message, {
            position: "top-center",
            autoClose: 2000
        })
        MemberLists()


    } catch (error) {
        toast.error(error.response.data.message, {
            position: "top-center",
            // autoClose: 2000
        })
    }
    
}

    useEffect(() => {
        viewGroup()
        MemberLists()
    }, [])
    return (
        <div className=''>
            <h1 className="mb-4 text-3xl text-center  font-extrabold text-gray-900 dark:text-white md:text-4xl lg:text-4xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">Bill Splitterer</span> </h1>

            {
                isOpen && (
                    <div  className='flex '> 
                        <div>
                            <h1 className='text-2xl font-medium text-center'>
                                Add Member
                            </h1>
                            <div className='p-3 '>
                                <label htmlFor="group-member" className='text-xl'>Enter Name</label>
                                <input type="text" placeholder="Enter Name"
                                    value={memberName} onChange={(e) => setMemberName(e.target.value)}
                                    className='border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none  '
                                />
                            </div>
                            <div className='p-3 '>
                                <button onClick={() => setIsOpen(!isOpen)} className=" text-black border-2 py-2 px-4 rounded focus:outline-none mt-4 md:mt-0">Cancel</button>
                                <button onClick={addMembers}
                                    className="bg-gray-700 ml-3 hover:bg-gray-800 text-white py-2 px-4 rounded focus:outline-none mt-4 md:mt-0">Add Member</button>
                            </div>
                        </div>
                        <div className='md:ml-20  w-72 '>
                            <h1 className='text-2xl font-medium text-center'>
                                Members List
                            </h1>
                            <div className='p-3 overflow-y-auto h-44 '>
                                <ul>
                                    {
                                        memberList.map((member, index) => (
                                            <li key={index} className='flex justify-between'>
                                                <p className='text-xl'>{member.memberName}</p>
                                                <button onClick={() => deleteMember(member.member_id)} className='text-red-500'>Delete</button>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        </div>

                    </div>
                )

            }

            <div className='flex justify-end'>
                <button onClick={() => setIsOpen(!isOpen)}
                    className='bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded focus:outline-none mt-4 md:mt-0'>
                    Add Member
                </button>
            </div>

            <div className='w-full md:flex'>
                <div className='ml-2 md:w-1/2'>
                    <h1 className='text-3xl p-2'>Create Group</h1>
                    <div className='p-3'>
                        <label htmlFor="group-name" className='text-xl' >Group Name</label>
                        <input type="text" placeholder="Group Name"
                            value={GroupName} onChange={(e) => setGroupName(e.target.value)}

                            className='border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none'
                        />
                    </div>
                    <div className='p-3'>
                        <label htmlFor="group-member" className='text-xl'>Add Member</label>
                        <select value={memberName} onChange={(e) => setMemberName(e.target.value)}
                            className='border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none  '>
                            <option value="">-Select Member Name-</option>
                            {
                                memberList.map((member, index) => (
                                    <option key={index} value={member.memberName}>{member.memberName}</option>
                                ))
                            }

                        </select>
                    </div>
                    <div className='p-3 flex justify-center'>
                        <button onClick={() => AddMembersInArray(memberName)}
                            className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded focus:outline-none mt-4 md:mt-0"> Add </button>
                    </div>
                    <div className=''>
                        {
                            members.map((member, index) => (
                                <div key={index} className='p-3 mt-1 w-64  flex justify-between  border rounded-full'>
                                    <p className=''>{member.MemberName}
                                    </p>
                                    <button onClick={() => deletemeber(index)}
                                        className="  rounded-md text-red-600"    >
                                        <span className='mt-4'> <AiOutlineCloseCircle className='' /></span>
                                    </button>
                                </div>
                            ))
                        }
                    </div>
                    <div onClick={createGroup}
                        className='p-3 flex justify-center'>
                        <button className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded focus:outline-none mt-4 md:mt-0"> Create Group</button>
                    </div>
                </div>
                <div className='md:w-1/2'>
                    <h1 className='text-3xl p-2'>All Groups</h1>
                    <div>
                        <table className="table-auto border w-full">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border">Sr.no</th>
                                    <th className="px-4 py-2 border">Group Name</th>
                                    <th className="px-4 py-2 border">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    group.length > 0 ? (
                                        group.map((group, index) => (
                                            <tr key={index}>
                                                <td className="border px-4 py-2">{index + 1} </td>
                                                <td className="border px-4 py-2">{group.GroupName}</td>
                                                <td className="border px-4 py-2 flex">
                                                    <Link
                                                        to={`/Budget/Bill-Splitter/Group/${group.billSplitterGroup_id}`}
                                                        className="px-2 py-1  rounded-md text-blue-600"    >
                                                        <GrView className='' />
                                                    </Link>
                                                    <button
                                                        onClick={() => deleteGroup(group.billSplitterGroup_id	)
                                                        }
                                                        className="px-2 py-1  rounded-md text-red-600"    >
                                                        <RiDeleteBin6Line />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td className=" px-4 py-2">No Group created </td>
                                        </tr>
                                    )
                                }
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>

        </div>
    )
}

export default BillSplitterer