import React, { useState ,useEffect} from 'react'
import axios from 'axios'
import { server } from '../../../store'
import { toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
const Transcation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isedit, setIsedit] = useState(false);
  const [TransactionData, setTransactionData] = useState([]);
  const [transactioId, setTransactioId] = useState('');
  const [transactionType, setTransactionType] = useState("");
  const [transactionDate, setTransactionDate] = useState("")
  const [sender, setSender] = useState("")
  const [receiver, setReceiver] = useState("")
  const [method, setMethod] = useState("")
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit =async () => {
    if (transactionType === '' || transactionDate === '' || sender === '' || receiver === '' || method === '' || amount === '' ) {
      toast.error('Please Enter All Fields', { position: toast.POSITION.TOP_CENTER })
    } else {
    try {
      let token = localStorage.getItem('token')
      const { data } =await axios.post(`${server}/addTransaction`, {
        Transaction_type: transactionType,
        Transaction_date: transactionDate,
        Transaction_amount:amount,
        Transaction_senderName:sender,
        Transaction_receiverName:receiver,
        Transaction_method:method,
        Transaction_description:description
      },

        {
          headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'authorization': `Bearer ${token}`
          }
        })
        setIsOpen(false)
       toast.success(data.message, { position: toast.POSITION.TOP_CENTER });
       getTransaction()
      setTransactionType("")
      setTransactionDate("")
      setSender("")
      setReceiver("")
      setMethod("")
      setAmount('')
      setDescription('')

    } catch (error) {
      toast.error(error.response.data.message, { position: toast.POSITION.TOP_CENTER });

    }
  }
  }
const getTransaction = async () => {
  try {
    let token = localStorage.getItem('token')
    const { data } = await axios.get(`${server}/getTransaction`, {
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
        'authorization': `Bearer ${token}`
      }
    })
    setTransactionData (data.Transaction)
  } catch (error) {
    toast.error(error.response.data.message, { position: toast.POSITION.TOP_CENTER });
  }
}

const deleteTransaction = async (id) => {
  try {
    let token = localStorage.getItem('token')
    const { data } = await axios.delete(`${server}/deleteTransaction/${id}`, {
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
        'authorization': `Bearer ${token}`
      }
    })
    toast.success(data.message, { position: toast.POSITION.TOP_CENTER });
    getTransaction()
  } catch (error) {
    toast.error(error.response.data.message, { position: toast.POSITION.TOP_CENTER });
  }
}
const editTransaction = async () => {
  try {
    let token = localStorage.getItem('token')
    const { data } = await axios.put(`${server}/updateTransaction/${transactioId}`, {
      Transaction_type: transactionType,
      Transaction_date: transactionDate,
      Transaction_amount:amount,
      Transaction_senderName:sender,
      Transaction_receiverName:receiver,
      Transaction_method:method,
      Transaction_description:description
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
        'authorization': `Bearer ${token}`
      }
    })
    setIsedit(false)
    toast.success(data.message, { position: toast.POSITION.TOP_CENTER });
    getTransaction()
    setTransactionType("")
    setTransactionDate("")
    setSender("")
    setReceiver("")
    setMethod("")
    setAmount('')
    setDescription('')
  } catch (error) {
    toast.error(error.response.data.message, { position: toast.POSITION.TOP_CENTER });
  }
}



useEffect(() => {
  getTransaction()
}, [])

  return (
    <>
      <div className="flex flex-col h-screen">

        <header className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
          {
            isOpen ?   
            (<h1 className="text-2xl font-bold">Add Transactions</h1>):isedit ? 
             (<h1 className="text-2xl font-bold">Update Transactions</h1>) :
              (<h1 className="text-2xl font-bold">Transactions</h1>) 
          }
        
        </header>
        {
          isOpen || isedit ? (
            <div >
              <div className='flex flex-wrap gap-3 justify-center'>
                <div className="mb-4 w-1/4">
                  <label className="block text-gray-700 font-bold mb-2" htmlFor="transaction-type">
                    Transaction Type
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="transaction-type"
                    value={transactionType}
                    onChange={(event) => setTransactionType(event.target.value)}
                  >
                    <option value="">-- Select transaction type --</option>
                    <option value="Sent">Sent</option>
                    <option value="Received">Received</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div className="mb-4 w-1/4 ">
                  <label className="block text-gray-700 font-bold mb-2" htmlFor="amount">
                    Transactions Date
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="amount"
                    type="Date"
                    placeholder="Enter Date"
                    value={transactionDate}
                    onChange={(event) => setTransactionDate(event.target.value)}
                  />
                </div>
                <div className="mb-4 w-1/4 ">
                  <label className="block text-gray-700 font-bold mb-2" htmlFor="amount">
                    Transactions Amount
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                </div>
                <div className="mb-4 w-1/4 ">
                  <label className="block text-gray-700 font-bold mb-2" htmlFor="amount">
                    Sender Name
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="amount"
                    type="text"
                    placeholder="Enter amount"
                    value={sender}
                    onChange={(event) => setSender(event.target.value)}
                  />
                </div>
                <div className="mb-4 w-1/4 ">
                  <label className="block text-gray-700 font-bold mb-2" htmlFor="amount">
                    Receiver Name
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="amount"
                    type="text"
                    placeholder="Enter amount"
                    value={receiver}
                    onChange={(event) => setReceiver(event.target.value)}
                  />
                </div>
                <div className="mb-4 w-1/4 ">
                  <label className="block text-gray-700 font-bold mb-2" htmlFor="amount">
                    Payment Method
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="amount"
                    type="text"
                    placeholder="Enter amount"
                    value={method}
                    onChange={(event) => setMethod(event.target.value)}
                  />
                </div>


                <div className="mb-6 w-1/4">
                  <label className="block text-gray-700 font-bold mb-2" htmlFor="description">
                    Transaction Description
                  </label>
                  <textarea
                    className="shadow resize-none appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="description"
                    placeholder="Enter description"
                    cols={30}
                    rows={3}

                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className='md:flex md:justify-center'>
                <button
                  className="bg-blue-500 mr-3 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => {
                    setIsOpen(false)
                  setIsedit(false)
                  }
                  }
                >
                  Cancel
                </button>
                {
                  isedit ? (<>
                  
                  <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={editTransaction}
                >
                  update
                </button>
                  </>):(<>
                  <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
                  </>)
                }
              </div>
            </div>
          ) : " "
        }
        {
          isOpen || isedit ? " " : (
            <main className="p-4 flex-grow">
              <h2 className="text-2xl font-bold mb-4">Transactions</h2>
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <form action="#" method="GET" className="flex items-center">
                  <label htmlFor="search" className="sr-only">Search</label>
                  <input type="text" id="search" name="search" placeholder="Search" className="border border-gray-500 py-2 px-3 rounded-l-lg focus:outline-none focus:border-gray-700" />
                  <button type="submit" className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded-r-lg focus:outline-none">Search</button>
                </form>
                <button onClick={() => setIsOpen(true)} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded focus:outline-none">Add Transaction</button>
              </div>
              <div className="overflow-x-auto">
                <table className="table-auto border w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border">Type</th>
                      <th className="px-4 py-2 border">Date</th>
                      <th className="px-4 py-2 border">Amount</th>
                      <th className="px-4 py-2 border">Sender</th>
                      <th className="px-4 py-2 border">Receiver</th>
                      <th className="px-4 py-2 border">Method</th>
                      <th className="px-4 py-2 border">Description</th>
                      <th className="px-4 py-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                {
                  TransactionData.map((item, index) => {
                    return (
                      <tr key={index}>
                      <td className="px-4 py-2 border">{item.Transaction_type}</td>
                      <td className="px-4 py-2 border">{item.Transaction_date} </td>
                      <td className="px-4 py-2 border">{item.Transaction_amount}</td>
                      <td className="px-4 py-2 border">{item.Transaction_senderName}</td>
                      <td className="px-4 py-2 border">{item.Transaction_receiverName}</td>
                      <td className="px-4 py-2 border">{item.Transaction_method}</td>
                      <td className="px-4 py-2 border">{item.Transaction_description}</td>
                      <td className="px-4 py-2 border">
                        <button onClick={()=>{
                          setIsedit(true)
                          setTransactioId(item.Transaction_id)
                          setTransactionType(item.Transaction_type)
                          setTransactionDate(item.Transaction_date)
                          setAmount(item.Transaction_amount)
                          setSender(item.Transaction_senderName)
                          setReceiver(item.Transaction_receiverName)
                          setMethod(item.Transaction_method)
                          setDescription(item.Transaction_description)
                        }} className="text-blue-500 hover:text-blue-600">Edit</button>
                        <button onClick={()=>deleteTransaction(item.Transaction_id)} className="text-red-500 hover:text-red-600 ml-2">Delete</button>
                      </td>
                    </tr>
                    )
                  })

                }

                  </tbody>
                </table>
              </div>
            </main>
          )
        }

      </div>
    </>
  )
}

export default Transcation