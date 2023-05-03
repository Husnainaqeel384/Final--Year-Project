import React from "react";
import axios from "axios";
import { useEffect, useState } from "react";

import { server } from '../../../store';


const MainDashboard = () => {
  const [totalBudgets, setTotalBudgets] = useState(0);
  const [totalBillSpliterGroups, setTotalBillSpliterGroups] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalpendingreminder, setTotalpendingreminder] = useState(0);
  const [totaldonereminder, setTotaldonereminder] = useState(0);

  const getmaindashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(`${server}/mainpagedata`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTotalBudgets(data.totalBudgets);
      setTotalBillSpliterGroups(data.totalbillSpilterGroups);
      setTotalTransactions(data.totalTransaction);
      setTotalpendingreminder(data.totalPendingReminders);
      setTotaldonereminder(data.totaldoneReminders);
      setTotalUsers(data.totalUser);
    }
    catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getmaindashboard()
  }, [])
  return (
    <>
     
      <div className="bg-gray-200">
        <div className="container mx-auto">
          <div className="flex flex-wrap">
            {/* Four equal-sized boxes */}
            <div className="w-full md:w-1/2 xl:w-1/4 p-3">
              <div className="bg-white h-full p-5 rounded shadow">
                <h3 className="text-lg font-bold mb-4 text-center">Total Budgets</h3>
                <p className="text-center text-2xl mt-10">{totalBudgets} </p>
              </div>
            </div>
            <div className="w-full md:w-1/2 xl:w-1/4 p-3">
              <div className="bg-white h-full p-5 rounded shadow">
                <h3 className="text-lg font-bold mb-4 text-center">Total Split Groups</h3>
                <p className="text-center text-2xl mt-10">{totalBillSpliterGroups} </p>
              </div>
            </div>
            <div className="w-full md:w-1/2 xl:w-1/4 p-3">
              <div className="bg-white h-full p-5 rounded shadow">
                <h3 className="text-lg font-bold mb-4 text-center">Total Transaction Records</h3>
                <p className="text-center text-2xl mt-10">{totalTransactions} </p>
              </div>
            </div>
            <div className="w-full md:w-1/2 xl:w-1/4 p-3">
              <div className="bg-white h-full p-5 rounded shadow">
                <h3 className="text-lg font-bold mb-4 text-center">Total Reminders</h3>
                <div className="flex justify-between w-full">
                  <div className="w-1/2 border p-2 text-center">
                    <h3 className="text-lg font-bold mb-4 ">Pending</h3>
                    <p className="text-red-500"> {totalpendingreminder}</p>
                  </div>
                  <div className="w-1/2 border p-2 text-center">
                    <h3 className="text-lg font-bold mb-4">Done</h3>
                    <p className="text=center text-green-600">{totaldonereminder} </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Remaining tasks section */}
          <div className="flex flex-wrap mt-5">
            {/* <div className="w-full md:w-1/2 xl:w-1/3 p-3">
              <div className="bg-white h-full p-5 rounded shadow">
                <h3 className="text-lg font-bold mb-4">Remaining Tasks</h3>
                <ul>
                  <li>Task 1</li>
                  <li>Task 2</li>
                  <li>Task 3</li>
                  <li>Task 4</li>
                </ul>
              </div>
            </div> */}
            {/* Other charts */}
            {/* <div className="w-full md:w-1/2 xl:w-2/3 p-3">
              <div className="bg-white h-full p-5 rounded shadow">
                <h3 className="text-lg font-bold mb-4">Other Charts</h3>
                
              </div>
            </div> */}
          </div>
        </div>
      </div>


    </>
  )
}

export default MainDashboard