import React from 'react'
// import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
const UpdateExpense = () => {
  // const navigate = useNavigate();
  // const updateeditexpense = (catergoryName,amount) => {
  //   console.log(catergoryName)
  //   navigate('/Budget/Update-Category-Value' ,{
  //     itemId: catergoryName,
  //     otherParam: amount,
  //   })
  // }
  const data = [
    {
      catergoryName: "Water",
      Amount: 123
    }, {
      catergoryName: "Electricity",
      Amount: 123
    },
    {
      catergoryName: "Gas/Oil",
      Amount: 123
    }, {
      catergoryName: "Phone",
      Amount: 123
    }, {
      catergoryName: "Internet",
      Amount: 123
    }, {
      catergoryName: "Lawn/Garden",
      Amount: 123
    }, {
      catergoryName: "Maintenance",
      Amount: 123
    },
  ]

  return (
    <div className='mt-16 md:mt-5 lg:mt-5'>
      <h1 className="mb-4 text-3xl text-center font-extrabold text-gray-900 dark:text-white md:text-4xl lg:text-4xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">Update and Delete Expense</span> </h1>
      <div className=''>
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="p-4 w-1/6 border-r-4 border-indigo-400">
                <div className="flex items-center">
                  <p>SR.No</p>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 w-2/6 border-r-4 border-indigo-400">
                Category Name
              </th>
              <th scope="col" className="px-6 py-3 w-1/6 border-r-4 border-indigo-400">
                Amount
              </th>

              <th scope="col" className="px-6 py-3 w-1/6 border-r-4 border-indigo-400">
                Edit Amount
              </th>
              <th scope="col" className="px-6 py-3 w-1/6 ">
                Delete Category
              </th>
            </tr>
          </thead>
          <tbody>
            {
              data.map((items, index) => (
                <tr className="bg-white border-b  hover:bg-gray-50 " key={index}>
                  <td className="w-4 p-4 w-1/6 border-r-2 border-gray-200">
                    <div className="flex items-center">
                      <p>{index + 1}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4 w-2/6 border-r-2 border-gray-200 text-gray-500">
                    {items.catergoryName}
                  </td>
                  <td className="px-6 py-4 w-2/6 border-r-2 border-gray-200 text-gray-500">
                    {items.Amount}
                  </td>

                  <td className="px-6 py-4 border-r-2 border-gray-200">
                    {/* <div className="flex items-center">
                <div className="h-2.5 w-2.5  mr-2"></div> Admin
              </div> */}
                    <Link to={'/Budget/Update-Category-Value'}
                    state={{ categoryname:items.catergoryName,amount:items.Amount }}
                      
                      // onClick={() => { updateeditexpense(items.catergoryName,items.Amount) }}
                      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 ">
                      Edit</Link>
                  </td>
                  <td className="px-6 py-4 ">
                    <button className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:red:bg-blue-700 focus:outline-none dark:focus:ring-red-700 ">
                      Delete</button>
                  </td>
                </tr>

              ))
            }

          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UpdateExpense