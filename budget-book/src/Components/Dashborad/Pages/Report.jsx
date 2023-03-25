import React from 'react'

const Report = () => {
  return (
    <div className="flex flex-col h-screen">
    
        <header className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Reports</h1>
        </header>

      
        <main className="p-4 flex-grow">
       
            <div className="flex flex-col md:flex-row justify-between mb-4">
                <div className="flex items-center">
                    <label htmlFor="start-date" className="mr-2">Start Month:</label>
                    <select name="" id="" className="border border-gray-500 py-2 px-3 rounded-lg focus:outline-none focus:border-gray-700">
                        <option value="">-- Select Month --</option>
                        <option value="">March-2023</option>
                        <option value="">March-2023</option>
                        <option value="">Apirl-2023</option>
                        <option value="">May-2023</option>
                    </select>
                </div>        
                <button type="submit" className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded focus:outline-none mt-4 md:mt-0">Generate Report</button>
            </div>
            <div className="flex flex-col md:flex-row justify-between">
                <div className="w-full md:w-1/2 mb-4 md:mb-0">
                    <h3 className="text-lg font-bold mb-2">Expenses by Category</h3>
                    <canvas id="expenses-by-category"></canvas>
                </div>
               
            </div>
        </main>
 </div>
  )
}

export default Report