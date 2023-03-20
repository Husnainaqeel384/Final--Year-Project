import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from "react-router-dom";
const UpdateCategory = () => {
    const [nameofcategory, setnameofcategory] = useState('')
    const location = useLocation()
    const { categoryname, amount } = location.state
    // const location = useLocation();
    // console.log(location)
    // const catergoryName = location.state;
    // console.log(catergoryName)
    // setnameofcategory(prev=>nameofcategory=prev)
    const navigate = useNavigate();
    const backhandler = () => {
        navigate('/Budget/Edit-Expense')
    }
    return (
        <>
            <div className='md:mt-0 mt-12  md:ml-0 text-center z-200 w-full'>
                <h1 className="mb-4 text-3xl text-center font-extrabold text-gray-900 dark:text-white md:text-4xl lg:text-4xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">Update Category Amount Value</span> </h1>
                <div className='mt-4 border border-gray-400 w-96 md:ml-48 '>
                    <div className='flex flex-col justify-center items-center w-84 '>
                        <div className='w-full h-10 mt-4 text-xl text-center'>
                            <h1>Update Category Amount</h1>
                        </div>
                        <h1 className=' h-7 bg-[#3d85c6] text-white w-full text-center'>Category Name</h1>
                        <p className='h-8 bg-gray-300 w-full p-1 text-center mt-1'>
                            {categoryname}
                        </p>
                        <p className=' h-7 bg-[#3d85c6] text-white w-full text-center mt-1'>
                            <label htmlFor="">Previous Amount</label>
                        </p>
                        <input type="number" className='w-full text-center h-10 bg-gray-200 mt-1' value={amount} onChange={(e) => setnameofcategory(e.target.value)} />
                        <p className=' h-7 bg-[#3d85c6] text-white w-full text-center mt-1'>
                            <label htmlFor="">Enter New Amount</label>
                        </p>
                        <input type="number" className='w-full text-center h-10 bg-gray-200 mt-1' value={nameofcategory} onChange={(e) => setnameofcategory(e.target.value)} />
                        <div className='mt-2 h-9 w-full'>
                            <button onClick={backhandler} className='w-2/4 bg-gray-100 h-9'>Back</button>
                            <button className='w-2/4 bg-blue-600 text-white h-9'>Change</button>
                        </div>

                    </div>
                </div>
            </div>

        </>
    )
}

export default UpdateCategory