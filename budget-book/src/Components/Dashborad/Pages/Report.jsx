import React from 'react'

const Report = () => {
  return (
    <div class="flex flex-col h-screen">
    
        <header class="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
            <h1 class="text-2xl font-bold">Budget Book</h1>
        </header>

      
        <main class="p-4 flex-grow">
            <h2 class="text-2xl font-bold mb-4">Reports</h2>
            <div class="flex flex-col md:flex-row justify-between mb-4">
                <div class="flex items-center">
                    <label for="start-date" class="mr-2">Start Date:</label>
                    <input type="date" id="start-date" name="start-date" class="border border-gray-500 py-2 px-3 rounded-lg focus:outline-none focus:border-gray-700" />
                </div>
                <div class="flex items-center mt-4 md:mt-0">
                    <label for="end-date" class="mr-2">End Date:</label>
                    <input type="date" id="end-date" name="end-date" class="border border-gray-500 py-2 px-3 rounded-lg focus:outline-none focus:border-gray-700" />
                </div>
                <button type="submit" class="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded focus:outline-none mt-4 md:mt-0">Generate Report</button>
            </div>
            <div class="flex flex-col md:flex-row justify-between">
                <div class="w-full md:w-1/2 mb-4 md:mb-0">
                    <h3 class="text-lg font-bold mb-2">Expenses by Category</h3>
                    <canvas id="expenses-by-category"></canvas>
                </div>
                <div class="w-full md:w-1/2">
                    <h3 class="text-lg font-bold mb-2">Income vs Expenses</h3>
                    <canvas id="income-vs-expenses"></canvas>
                </div>
            </div>
        </main>
 </div>
  )
}

export default Report