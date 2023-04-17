import React from "react";
import { FaDollarSign } from "react-icons/fa";
import { RiArrowUpSLine, RiArrowDownSLine } from "react-icons/ri";

const BudgetCard = ({ title, amount, percentage, type }) => {
    const icon = type === "expense" ? <RiArrowDownSLine /> : <RiArrowUpSLine />;
    const color = type === "expense" ? "red" : "green";
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
            <div>
                <p className="text-gray-400">{title}</p>
                <p className="text-2xl font-semibold">${amount.toFixed(2)}</p>
            </div>
            <div className="flex items-center">
                <span
                    className={`${percentage < 0 ? "text-red-500" : "text-green-500"
                        } text-sm mr-2`}
                >
                    {percentage}%
                </span>
                <div
                    className={`bg-${color}-100 rounded-full p-2 flex items-center justify-center`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
};

const MainDashboard = () => {
    return (
        <>
        {/* <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Budget Dashboard</h1>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-semibold mb-2">Summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-600 mb-2">Income</h3>
                  <p className="text-2xl font-semibold text-blue-900">$5,000</p>
                </div>
                <div className="bg-green-100 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-600 mb-2">Expenses</h3>
                  <p className="text-2xl font-semibold text-green-900">$3,000</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-semibold mb-2">Recent Transactions</h2>
              <div className="overflow-x-auto">
                <table className="table-auto w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">03/31/2023</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Groceries</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium text-green-600">$50.00</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">03/30/2023</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Gas</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium text-green-600">$30.00</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">03/29/2023</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text gray-900">Salary</td>

                        <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium text-blue-600">$1,000.00</td>
                    </tr>
                    </tbody>
                </table>
                </div>
            </div>
            </div>
            <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-semibold mb-2">Budgets</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <BudgetCard

                            title="Groceries"
                            amount={500}
                            percentage={-10}
                            type="expense"
                        />
                        <BudgetCard

                            title="Gas"
                            amount={300}
                            percentage={-5}
                            type="expense"
                        />
                        <BudgetCard

                            title="Salary"
                            amount={1000}
                            percentage={10}
                            type="income"
                        />
                        <BudgetCard

                            title="Investment"
                            amount={500}
                            percentage={5}
                            type="income"
                        />
                    </div>
                </div>
            </div>
        </div>
        </div>
        </div> */}

{/* <div className="flex flex-col h-screen">
      <nav className="bg-gray-800 px-4 py-2">
        <div className="flex justify-between items-center">
          <h1 className="text-white font-bold text-xl">Budget Dashboard</h1>
          <button className="text-white hover:text-gray-300 focus:text-gray-300">
            Logout
          </button>
        </div>
      </nav>
      <div className="flex-1 p-4">
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-md shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Total Budget</h3>
              <span className="text-2xl font-bold text-gray-800">$10,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Spent</span>
              <span className="text-gray-800">$5,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Remaining</span>
              <span className="text-green-600 font-bold">$5,000</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-md shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Total Income</h3>
              <span className="text-2xl font-bold text-gray-800">$8,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Received</span>
              <span className="text-gray-800">$6,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending</span>
              <span className="text-yellow-600 font-bold">$2,000</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-md shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Expenses</h3>
              <span className="text-2xl font-bold text-gray-800">$5,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Food</span>
              <span className="text-gray-800">$2,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rent</span>
              <span className="text-gray-800">$1,500</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Transportation</span>
              <span className="text-gray-800">$1,000</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-md shadow-md">
            <div    className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Savings</h3>

                <span className="text-2xl font-bold text-gray-800">$1,000</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-600">Investment</span>
                <span className="text-gray-800">$500</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-600">Emergency</span>
                <span className="text-gray-800">$500</span>
            </div>
            </div>
        </div>
        <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">

            <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-semibold mb-2">Transactions</h2>
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Edit</span>
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">12/12/2020</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Salary</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Income
                        </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        $5,000
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" className="text-indigo-600 hover:text-indigo-900">Edit</a>
                        </td>
                    </tr>

                    <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">12/12/2020</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Salary</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Income
                        </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        $5,000
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" className="text-indigo-600 hover:text-indigo-900">Edit</a>
                        </td>
                    </tr>

                    <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">12/12/2020</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Salary</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Income
                        </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        $5,000
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" className="text-indigo-600 hover:text-indigo-900">Edit</a>
                        </td>
                    </tr>

                    <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">12/12/2020</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Salary</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Income
                        </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        $5,000
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" className="text-indigo-600 hover:text-indigo-900">Edit</a>
                        </td>
                    </tr>

                    <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">12/12/2020</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Salary</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Income
                        </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        $5,000
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href="#" className="text-indigo-600 hover:text-indigo-900">Edit</a>
                        </td>
                    </tr>


                    </tbody>
                </table>
                </div>
            </div>
            </div>
        </div>

        </div>
         */}
 <div className="bg-gray-200">
      <div className="container mx-auto">
        <div className="flex flex-wrap">
          {/* Four equal-sized boxes */}
          <div className="w-full md:w-1/2 xl:w-1/4 p-3">
            <div className="bg-white h-full p-5 rounded shadow">
              <h3 className="text-lg font-bold mb-4">Box 1</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce quis elit hendrerit, ullamcorper est eget, mollis lorem. Vestibulum euismod lorem nec venenatis blandit. </p>
            </div>
          </div>
          <div className="w-full md:w-1/2 xl:w-1/4 p-3">
            <div className="bg-white h-full p-5 rounded shadow">
              <h3 className="text-lg font-bold mb-4">Box 2</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce quis elit hendrerit, ullamcorper est eget, mollis lorem. Vestibulum euismod lorem nec venenatis blandit. </p>
            </div>
          </div>
          <div className="w-full md:w-1/2 xl:w-1/4 p-3">
            <div className="bg-white h-full p-5 rounded shadow">
              <h3 className="text-lg font-bold mb-4">Box 3</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce quis elit hendrerit, ullamcorper est eget, mollis lorem. Vestibulum euismod lorem nec venenatis blandit. </p>
            </div>
          </div>
          <div className="w-full md:w-1/2 xl:w-1/4 p-3">
            <div className="bg-white h-full p-5 rounded shadow">
              <h3 className="text-lg font-bold mb-4">Box 4</h3>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce quis elit hendrerit, ullamcorper est eget, mollis lorem. Vestibulum euismod lorem nec venenatis blandit. </p>
            </div>
          </div>
        </div>
        {/* Remaining tasks section */}
        <div className="flex flex-wrap mt-5">
          <div className="w-full md:w-1/2 xl:w-1/3 p-3">
            <div className="bg-white h-full p-5 rounded shadow">
              <h3 className="text-lg font-bold mb-4">Remaining Tasks</h3>
              <ul>
                <li>Task 1</li>
                <li>Task 2</li>
                <li>Task 3</li>
                <li>Task 4</li>
              </ul>
            </div>
          </div>
          {/* Other charts */}
          <div className="w-full md:w-1/2 xl:w-2/3 p-3">
            <div className="bg-white h-full p-5 rounded shadow">
              <h3 className="text-lg font-bold mb-4">Other Charts</h3>
              {/* Place other charts here */}
            </div>
          </div>
        </div>
        </div>
        </div>
    

        </>
    )
}

export default MainDashboard