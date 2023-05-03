import React, { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { server } from '../../../store'
import { toast } from 'react-toastify'
import { AiOutlineClose } from 'react-icons/ai'
const ViewBillspliterGroup = () => {

    const { id } = useParams()
    const [groupName, setGroupName] = useState('')
    const [groupMembers, setGroupMembers] = useState([])
    const [isBillClear, setIsBillClear] = useState(false)
    const [mode, setMode] = useState('')
    const [bill, setBill] = useState('')
    const [clearbillamount, setClearbillamount] = useState(0)
    const [isAddbill, setIsAddbill] = useState(false)
    const [billDetailsDescription, setBillDetailsDescription] = useState([])

    const getGroupDetails = useCallback(async () => {
        try {
            const token = localStorage.getItem('token')
            const { data } = await axios.get(`${server}/getGroup/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            setGroupMembers(data.getMembers)
            setGroupName(data.getGroup[0].GroupName)
            setBillDetailsDescription(data.billsplitterdetailDescription)

        } catch (error) {

        }
    }, [id])

    const billSplit = async () => {

        try {
            if (mode === '') {
                toast.error('Please Select Mode')
            }
            else if (bill === '') {
                toast.error('Please Enter Bill Amount')
            }
            else {
                const token = localStorage.getItem('token')
                const { data } = await axios.post(`${server}/billSplit`, {
                    billSplitterGroup_id: id,
                    mode,
                    bill: bill
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                toast.success(data.message)
                getGroupDetails()
                setIsAddbill(false)
                setBill('')
                setMode('')
            }
        } catch (error) {
            toast.error(error.response.data.message)
        }
    }

    const Clearbill = async () => {
        try {
            
          
                const token = localStorage.getItem('token')
                const { data } = await axios.post(`${server}/clearBill`, {
                    billSplitterGroup_id: id,
                    clearbillamount
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                toast.success(data.message, { position: 'top-center' })
                getGroupDetails()
                setClearbillamount(0)
                setIsBillClear(false)
 
        } catch (error) {
            toast.error(error.response.data.message)
            getGroupDetails()
            setClearbillamount(0)
            setIsBillClear(false)
        }
    }




    useEffect(() => {
        getGroupDetails()
    }, [getGroupDetails])
    return (
        <>
            <div>
                <h1 className='text-2xl font-bold text-gray-800 text-center mt-4' >View Billspliter Group</h1>
            </div>
            <div>
                <p className='text-xl mt-2 '>
                    Group Name: <span className='text-lg font-bold bg-amber-400 p-2 rounded'>{groupName}</span>
                </p>
            </div>
            <div className='md:w-full md:flex  mt-8'>
                <div className='md:w-1/3'>
                    <table className="table-auto border w-full">
                        <thead>
                            <tr>
                                <th className="w-1/5 border">Sr.no</th>
                                <th className="px-4 py-2 w-3/5 border">Group Members</th>
                                <th className="px-4 py-2 w-1/5 border">Bill</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                groupMembers.length > 0 ? (
                                    groupMembers.map((member, index) => {
                                        return (
                                            <tr key={index}>
                                                <td className="border px-4 py-2">{index + 1}</td>
                                                <td className="border px-4 py-2">{member.MemberName}</td>
                                                <td className="border px-4 py-2">{member.bill}</td>
                                            </tr>
                                        )
                                    })
                                )
                                    : (
                                        <tr>
                                            <td className=" ">No Members</td>
                                        </tr>
                                    )

                            }
                        </tbody>

                    </table>
                </div>
                <div className='md:w-2/3 border p-3 h-96 overflow-y-auto'>
                    {
                        isAddbill ? (
                            <div className='p-1'>
                                <h1 className='text-xl font-semibold md:ml-4'>Add Bill</h1>
                                <input type="number"
                                    onChange={(e) => setBill(e.target.value)}
                                    value={bill}
                                    className='border-2 border-gray-300 text-center bg-white h-10  rounded-lg text-sm focus:outline-none'
                                    placeholder='Enter Amount' />
                                <select value={mode} onChange={(e) => setMode(e.target.value)}
                                    className=' ml-2 border-2 border-gray-300 bg-white w-64 h-10 px-5 rounded-lg text-sm focus:outline-none'>
                                    <option value="">--select Mode--</option>
                                    <option value="All">Bill Split Equally</option>
                                    <option value="2">Paid By You and Split Equally</option>
                                    {/* {
                                        groupMembers.map((member, index) => {
                                            return (
                                                <option value={member.MemberName}>{`Paid by ${member.MemberName} and split Equally`}</option>
                                            )
                                        }
                                        )
                                    } */}
                                </select>
                                <button onClick={billSplit}
                                    className='bg-green-500 text-white  px-5 py-1 rounded-lg ml-2'>Add</button>
                                <button onClick={() => setIsAddbill(false)}
                                    className='border text-red-600 text-xl   px-5 py-1 rounded-lg ml-2'><AiOutlineClose />  </button>

                            </div>
                        ) :
                            isBillClear ?

                                (
                                    <div className='p-1'>
                                        <h1 className='text-xl font-semibold md:ml-4'>Clear Bill</h1>
                                        <input type="number"
                                            onChange={(e) => setClearbillamount(e.target.value)}
                                            value={clearbillamount}
                                            className='border-2 border-gray-300 text-center bg-white h-10  rounded-lg text-sm focus:outline-none'
                                            placeholder='Enter Amount' />
                                        {/* <select value={mode} onChange={(e) => setMode(e.target.value)}
                                            className=' ml-2 border-2 border-gray-300 bg-white w-64 h-10 px-5 rounded-lg text-sm focus:outline-none'>
                                            <option value="">--select Mode--</option>
                                            <option value="All">Bill Split Equally</option>
                                            <option value="2">Paid By You and Split Equally</option>
                                       
                                        </select> */}
                                        <button onClick={Clearbill}
                                            className='bg-green-500 text-white  px-5 py-1 rounded-lg ml-2'>Clear</button>
                                        <button onClick={() => setIsBillClear(false)}
                                            className='border text-red-600 text-xl   px-5 py-1 rounded-lg ml-2'><AiOutlineClose />  </button>

                                    </div>

                                ) :
                                (
                                    <div className='p-1'>
                                        <button className='bg-green-500 text-white  px-5 py-1 rounded-lg ml-2' onClick={() => setIsAddbill(true)}>Add Bill</button>
                                        <button className='bg-orange-500 text-white  px-5 py-1 rounded-lg ml-2' onClick={() => setIsBillClear(true)}>Clear Bill</button>
                                        <hr className='mt-3' />
                                        <div>
                                            <h1 className='text-xl font-semibold md:ml-4'>Bill Details</h1>
                                            <div className=' w-full'>
                                                {
                                                    billDetailsDescription.length > 0 ? (
                                                        billDetailsDescription.map((bill, index) => {
                                                            return (
                                                                <div className='flex justify-between border-b p-2' key={index}>
                                                                    <p className='w-1/4 border-r-2 p-2'>{bill.date}</p>
                                                                    <p className='w-3/4  p-2'>{bill.description}</p>
                                                                </div>
                                                            )
                                                        })
                                                    ) : (
                                                        <div className='flex justify-between border-b p-2'>
                                                            <p className='text-lg'>No Bill Details</p>
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )
                    }
                </div>
            </div>

        </>
    )
}

export default ViewBillspliterGroup