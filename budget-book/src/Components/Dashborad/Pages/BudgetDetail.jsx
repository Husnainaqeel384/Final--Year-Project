import React, { useState, useEffect } from 'react'
import { Category, subCategory } from '../../data/sidebarlinks'
import { server } from '../../../store';
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import Axios from 'axios'
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import axios from 'axios';
const BudgetDetail = () => {
  const navigate = useNavigate()

  const [subCategoryValue, setsubCategoryValue] = useState("");
  const [Amount, setAmount] = useState(0);
  const [values, setValues] = useState([]);
  const [totalIncome, settotalIncome] = useState(0)
  const [totalBudgetIncome, settotalBudgetIncome] = useState(0)
  const [reduceincome, setreduceincome] = useState(0)
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const handleMainCategorySelect = async (event) => {
    const selectedMainCategoryId = parseInt(event.target.value);
    const selectedMainCategory = mainCategories.find(category => category.category_id === selectedMainCategoryId);
    let token = localStorage.getItem('token')
    if (selectedMainCategory) {
      const { data } = await axios(`${server}/subCategories?categoryId=${selectedMainCategoryId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json',
          'authorization': `Bearer ${token}`
        }
      })
      setSubCategories(data.subCategories);
    } else {
      setSubCategories([]);
    }
  }
  const getTotalAmount = async () => {
    try {
      let token = localStorage.getItem('token')
      const { data } = await Axios.get(`${server}/getTotalAmount`, {
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json',
          'authorization': `Bearer ${token}`
        }
      })
      settotalIncome(data.budgetincome[0].Total_Income)
      settotalBudgetIncome(data.budgetincome[0].Total_Income)
    } catch (error) {
      console.log(error.response.data.message)
    }

    // const totalAmount = values.reduce((total, item) => {
    // return (total += item.Amount);
    // }, 0);
  }

  const handleAdd = (subCategoryValue, Amount) => {
    if (Amount === 0) {
      toast.error('Please Enter Amount')
    } else {
      const isUnique = values.every((value) => value.categoryName !== subCategoryValue);
      if (isUnique) {

        const result = totalIncome - Amount
        settotalIncome(result)
        const value = totalBudgetIncome - result

        setreduceincome(value)
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

    const result = totalIncome + parseFloat(newArray[index].Amount)
    newArray.splice(index, 1);
    settotalIncome(result)
    setreduceincome(totalIncome - result)

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
  const getCategories = async () => {
    try {
      let token = localStorage.getItem('token')
      const { data } = await Axios.get(`${server}/getCategories`, {
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/json',
          'authorization': `Bearer ${token}`

        }
      })

      setMainCategories(data.categories)
    } catch (error) {

    }
  }
  useEffect(() => {
    getTotalAmount()
    getCategories()
  }, [])

  return (

    <>
      <div className='mt-20 md:m-0'>
        <h1 className="mb-4 text-3xl text-center font-extrabold text-gray-900 dark:text-white md:text-4xl lg:text-4xl"><span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">Let's Create the Monthly Expense </span> </h1>
      </div>
      <div className='w-full border border-gray-200 flex flex-col'>
        <div className='flex  w-full'>
          <div className='w-2/4 ml-12 mt-12 '>
            <h1 className='mb-4 text-xl   text-gray-900 dark:text-black md:text-4xl lg:text-xl'>Select the Main Expense Category</h1>
            <select onChange={handleMainCategorySelect} className='border border-gray w-56 h-8 text-gray bg-gray-200'>
              <option value="">Select a main category</option>
              {mainCategories.map(category => (
                <option key={category.category_id} value={category.category_id} className='w-48 p-8' >{category.category_name}</option>
              ))}
            </select>
          </div>
          <div style={{
            width: 150, height: 150,

          }} className='w-2/4  md:ml-8 md:mt-8  '>
            <CircularProgressbar

              maxValue={totalIncome}
              value={reduceincome}
              className='w-full' text={totalIncome} />

          </div>
          <div className='md:ml-12 md:mt-4 '>
            <p className='font-bold' >Total Income</p>
            <span className='text-green-700 text-xl p-2'>{totalBudgetIncome}</span>

          </div>
        </div>
        <div className='md:ml-12 md:-mt-9 ml-3 mt-5'>
          <h1 className='mb-4 text-xl  text-gray-900 dark:text-black md:text-4xl lg:text-xl'>Add the Sub Expense Category</h1>
          <div className=' w-full flex'>
            <select value={subCategoryValue} onChange={(e) => setsubCategoryValue(e.target.value)} className='border border-grayw-52 md:w-3/5 h-8 text-gray bg-gray-200'>
              <option value="">Select a subcategory</option>
              {subCategories.map(subCategory => (
                <option key={subCategory.subCategory_id} value={subCategory.subCategoryName}>{subCategory.subCategoryName}</option>
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

