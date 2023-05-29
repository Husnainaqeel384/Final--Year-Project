import React from 'react';

const Newsletter = () => {
    return (
        <div className="flex flex-col items-center justify-center mb-6 mt-6  ">
            <div className='md:w-1/2 rounded-3xl box-shadows border-white p-4 '>
                <h2 className="text-3xl pt-6 font-bold text-indigo-600 text-center mb-4">
                    Newsletter
                </h2>
                <p className='text-center italic text-green-900 mb-5 sm:p-2' >Stay up to date with our latest news and updates!</p>
                <form className="flex flex-col w-full justify-center items-center">
                    <input
                        className="bg-white border text-blue-900 border-blue-500 rounded-md p-2  w-80 text-left"
                        type="email"
                        placeholder="Enter your email"
                    />
                    <button className="text-white border font-bold w-32 text-center mt-8 p-2 rounded-lg hover:-translate-y-1 hover:scale-110 bg-indigo-500 duration-300 hover:text-white hover:font-bold hover:shadow-[0_4px_0px_rgb(0,0,0)]">
                        Subscribe
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Newsletter;
