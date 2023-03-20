import React, { useState } from 'react'
import { Category, subCategory } from '../../data/sidebarlinks'
import { server } from '../../../store';
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Axios from 'axios'
const BudgetDetail = () => {
  const navigate = useNavigate()


  const [selectedValues, setSelectedValues] = useState("");
  const [subCategoryValue, setsubCategoryValue] = useState("");
  const [Amount, setAmount] = useState(0);
  const [values, setValues] = useState([]);

  const handleMainDropdownChange = (event) => {
    setSelectedValues(event.target.value);
  };

  const handleAdd = (subCategoryValue, Amount) => {
    if (Amount === 0) {
      toast.error('Please Enter Amount')
    } else {
      const isUnique = values.every((value) => value.categoryName !== subCategoryValue);
      if (isUnique) {
        setValues([...values, { categoryName: subCategoryValue, Amount: Amount }]);
      } else {
        toast.error('Duplicate Category Name Not allow');
      }
      // setValues([...values, { categoryName: subCategoryValue, Amount: Amount }]);

    }
  };
  // console.log(values)
  const removeFields = (index) => {
    const newArray = [...values];
    newArray.splice(index, 1);
    setValues(newArray);
  };
  const saveBudget = async () => {
    try {
      let token = localStorage.getItem('token')
      const { data } = await Axios.post(`${server}/budget-detail`,

        values
        , {
          headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'authorization': `Bearer ${token}`
          }
        })

      toast.success(data.message)
      setValues([])
      navigate('/Budget/current')
    } catch (error) {
      console.log(error.response.data.message)
    }
  }
  return (

    <>
      <div className='mt-20 md:m-0'>
        <h1 className="mb-4 text-3xl text-center font-extrabold text-gray-900 dark:text-white md:text-4xl lg:text-4xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">Let's Create the Monthly Expense </span> </h1>
      </div>
      <div className='w-full border border-gray-200 flex flex-col'>
        <div className='ml-12 mt-8'>
          <h1 className='mb-4 text-xl   text-gray-900 dark:text-black md:text-4xl lg:text-xl'>Select the Main Expense Category</h1>
          <select value={selectedValues} onChange={handleMainDropdownChange} className='border border-gray w-56 h-8 text-gray bg-gray-200'>
            <option value="" className='w-48 p-4'>Select an option</option>
            {Category.map((option) => (
              <option key={option.value} value={option.value} className='w-48 p-8'>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className='md:ml-12 ml-3 mt-5'>
          <h1 className='mb-4 text-xl  text-gray-900 dark:text-black md:text-4xl lg:text-xl'>Add the Sub Expense Category</h1>
          <div className=' w-full flex'>
            <select value={subCategoryValue} onChange={(e) => setsubCategoryValue(e.target.value)} className='border border-grayw-52 md:w-3/5 h-8 text-gray bg-gray-200'>
              <option value="">Select an option</option>
              {selectedValues &&
                subCategory[selectedValues].map((subOption) => (
                  <option key={subOption.value} value={subOption.value}>
                    {subOption.label}
                  </option>
                ))}
            </select>
            <p className='md:w-96 w-64 text-center'>
              <label htmlFor="">Enter Amount</label>
            </p>
            <input
              type="number"
              value={Amount}
              className='w-28 md:w-2/5 h-7 border border-gray-300 text-center'
              placeholder='0.00'
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className='w-full flex justify-end'>
              <button onClick={() => handleAdd(subCategoryValue, Amount)} className="text-white  bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Add </button>
            </div>
          </div>
        </div>
        <div className='ml-3 md:ml-8  mt-8'>
          <div className='w-full flex uppercase  h-7 bg-[#3d85c6] text-white'>
            <h2 className=' w-2/5 text-center border border-white'>Category Name</h2>
            <h2 className='w-2/5  text-center border border-white'>Amount</h2>
            <h2 className='w-1/5  text-center border border-white'>Delete</h2>
          </div>
          {values.map((item, index) => (
            <div key={index} className='w-full   flex'>
              <p className='w-2/5 border border-gray-200 text-center'>
                {item.categoryName}
              </p>
              <input
                type="text"
                value={item.Amount}
                className=' w-2/5 h-7 border border-gray-200 text-center'
                placeholder='0.00'
                readOnly
              />
              <button onClick={() => removeFields(index)} className=' w-1/5 h-7 border border-gray-200 bg-red-600 text-white'>Delete</button>
            </div>
          ))}
        </div>

        <div className='m-4 mt-14 flex justify-between items-center  border-t-2 border-gray-200'>
          <p className='text-gray-700'>When you make the Expense, then save the budget</p>
          <button onClick={saveBudget}
            className="text-white mt-4  bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" >Submit</button>
        </div>
      </div>
    </>
  )
}

export default BudgetDetail

