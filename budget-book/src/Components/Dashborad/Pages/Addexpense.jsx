import React, { useState } from 'react'
import { Category, subCategory } from '../../data/sidebarlinks'
import { useStateContext } from '../../../context/ContextProvider'
import { server } from '../../../store';
import { toast } from 'react-hot-toast'
// import { useNavigate } from 'react-router-dom'
import Axios from 'axios'
const Addexpense = () => {
  // const navigate = useNavigate()

  const { openExpenseDropdown, setopenExpenseDropdown } = useStateContext();
  const [selectedValues, setSelectedValues] = useState("");
  const [categoryName, setcategoryName] = useState('');
  const [Amount, setAmount] = useState('');
  const [description, setdescription] = useState('');

  const handleOptionChange = (event) => {
    setSelectedValues(event.target.value);
  };

  const handleInputChange = (event) => {
    setAmount(event.target.value);
  };

  const handleTextareaChange = (event) => {
    setdescription(event.target.value);
  };

  const handleCancelClick = () => {
    setopenExpenseDropdown(false);
    setSelectedValues('');
    setAmount('');
    setdescription('');
  };

  const handleSubmitClick =async () => {
    try {
      let token = localStorage.getItem('token')
      const { data } = await Axios.post(`${server}/dailyExpenseRecord`,
        {

          ExpensecategoryName: categoryName,
          description: description,
          currentAmount: Amount
        }
        , {
          headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'authorization': `Bearer ${token}`
          }
        })

      toast.success(data.message)

      // navigate('/Budget/Add-Expenses')
      setopenExpenseDropdown(!openExpenseDropdown)
      // window.location.reload();
    } catch (error) {
      console.log(error.response.data.message)
    }
  };

  return (
    <div className={`fixed z-10 inset-0 overflow-y-auto ${openExpenseDropdown ? '' : 'hidden'}`}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Add Expense</h3>
                <div className="mt-4">
                  <label htmlFor="option" className="block text-gray-700 font-bold mb-2">
                    Select Main Category
                  </label>
                  <select
                    id="option"
                    name="option"
                    className="form-select w-full mb-4 px-4 py-2 rounded-md shadow-sm"
                    value={selectedValues}
                    onChange={handleOptionChange}
                  >
                    <option value="">Select an option</option>
                    {Category.map((option) => (
                      <option key={option.value} value={option.value} className='w-48 p-8'>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {selectedValues && (
                    <div className="mt-4">
                      <label htmlFor="subOption" className="block text-gray-700 font-bold mb-2">
                        Category Name
                      </label>
                      <select
                        id="subOption"
                        name="subOption"
                        onChange={(e)=>{setcategoryName(e.target.value)}}
                        className="form-select w-full mb-4 px-4 py-2 rounded-md shadow-sm"
                      > <option value="">Select an option</option>
                        {selectedValues &&
                          subCategory[selectedValues].map((subOption) => (
                            <option key={subOption.value} value={subOption.value}>
                              {subOption.label}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                  <label htmlFor="input" className="block text-gray-700 font-bold mb-2">
                    Input
                  </label>
                  <input
                    type="text"
                    id="input"
                    name="input"
                    placeholder='0.00'
                    className="form-input w-full mb-4 px-4 py-2 rounded-md shadow-sm border border-gray-200 text-center"
                    value={Amount}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="textarea" className="block text-gray-700 font-bold mb-2">
                    Textarea
                  </label>
                  <textarea
                    id="textarea"
                    name="textarea"
                    rows="3"
                    cols={60}
                    placeholder="Write your thoughts here..."
                    className="form-textarea w-full mb-4 px-4 py-2  resize-none rounded-md shadow-sm border border-gray-200 text-center"
                    value={description}
                    onChange={handleTextareaChange}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleCancelClick}
            >
              Cancel
            </button>
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleSubmitClick}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>

  )
}
export default Addexpense
