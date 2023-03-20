import React from 'react'

const ChangePassword = () => {
    return (
        <>
            <div className='mt-14 md:m0'>
                <h1 className="mb-4 text-2xl md:text-center font-extrabold text-gray-900 dark:text-white md:text-xl lg:text-4xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">Change Password</span> </h1>
                <div className=' md:w-3/4'>
                    <div className='flex gap-5 p-3 w-full '>
                        <p className='w-2/6  text-center  bg-gray-100 p-1'>Current Password </p>
                        <input type="password" name="currentpassword" id="" className='w-4/6 p-1 bg-gray-100' />
                    </div>
                    <div className='flex gap-5 p-3 w-full '>
                        <p className='w-2/6  text-center  bg-gray-100 p-1'>New Password </p>
                        <input type="password" name="New Password" className='w-4/6 p-1 bg-gray-100' />
                    </div>
                    <div className='flex gap-5 p-3 w-full '>
                        <p className='w-2/6  text-center  bg-gray-100 p-1'>Comfirm Password </p>
                        <input type="password" name="comfirmpassword" className='w-4/6 p-1 bg-gray-100' />
                    </div>

                    <div className='flex gap-5 p-3 w-full '>
                        <button className='w-3/6  text-center p-1  text-white bg-blue-400 ' >Change Password</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChangePassword