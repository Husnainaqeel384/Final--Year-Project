import React, { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import DashboardNavbar from './Widget/DashboardNavbar'
import MainDashboard from './Widget/MainDashboard'
import Sidebar from './Widget/Sidebar'
import './../Styles/Dashborad.scss'
import { useStateContext } from '../../context/ContextProvider'
import NewBudget from './Pages/NewBudget'
import Users from './Pages/Users'
import CurrentBudget from './Pages/CurrentBudget'
import ALLBudgtes from './Pages/ALLBudgtes'
import BudgetDetail from './Pages/BudgetDetail'
import Profile from './Pages/Profile'
import UpdateUserProfile from './Pages/UpdateUserProfile'
import ChangePassword from './Pages/ChangePassword'
import DailReminder from './Pages/DailReminder'
import Transcation from './Pages/Transcation'
import Expense from './Pages/Expense'
import UpdateMonthlyExpense from './Pages/UpdateMonthlyExpense'
import UpdateCategory from './Pages/UpdateCategory'
import Report from './Pages/Report'
import Categories from './Pages/Categories'
import { server } from '../../store'
import axios from 'axios'
import BillSplitterer from './Pages/BillSplitterer'
import ViewBillspliterGroup from './Pages/ViewBillspliterGroup'
const DashboardRoutes = () => {
    const { activeMenu } = useStateContext();
    const [userIsAdmin , setuserIsAdmin]=useState(false)
    const [url,seturl]=useState('')
    const[username,setusername]=useState('')
    const getuserdata = async() => {
        try {
            let token = localStorage.getItem('token');
            const { data } =await axios.get(`${server}/getuserdata`, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })
            
            if(data.user[0].role === 'Admin'){
                setuserIsAdmin(true)
            }
            setusername(data.user[0].UserName)
           
            seturl(`${server}/user/profile/${data.user[0].image}`)
        } catch (error) {

        }
    }

    useEffect(() => {
        getuserdata();
    }, [])
    return (
        <>
            <div className='flex relative' >
                {
                    activeMenu ?
                        (<>
                            <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white ">
                                <Sidebar userIsAdmin={userIsAdmin} />
                            </div>
                        </>)
                        :
                        (<>
                            <div className="w-0 dark:bg-secondary-dark-bg">
                                <Sidebar userIsAdmin={userIsAdmin} />
                            </div>
                        </>)
                }
                <div className={`dark:bg-main-bg bg-main-bg min-h-screen w-full 
                    ${activeMenu ? 'md:ml-72' : 'flex-2'}`}>
                    <div className='fixed md:static bg-main-bg navbar w-full navbarshadow'>
                        <DashboardNavbar username={username} url={url} />

                    </div>

                    <div>
                        <Routes>
                            <Route index element={<MainDashboard />} />
                            <Route exact path='new' element={<NewBudget />} />
                            <Route exact path='current' element={<CurrentBudget />} />
                            <Route exact path='all-budgets' element={<ALLBudgtes />} />
                            <Route exact path='users' element={<Users />} />
                            <Route exact path='Add-Expenses' element={<Expense />} />
                            <Route exact path='/Budget-detail' element={<BudgetDetail />} />
                            <Route exact path='/User-profile' element={<Profile />} />
                            <Route exact path='/update-user-profile' element={<UpdateUserProfile />} />
                            <Route exact path='/change-password' element={<ChangePassword />} />
                            <Route exact path='/daily-reminder' element={<DailReminder />} />
                            <Route exact path='/transactions' element={<Transcation />} />
                            <Route exact path='/Edit-Expense' element={<UpdateMonthlyExpense />} />
                            <Route exact path='/report' element={<Report />} />
                            <Route exact path='//Update-Category-Value' element={<UpdateCategory />} />
                            <Route exact path='/add-category' element={<Categories />} />
                            <Route exact path='/Bill-Splitter' element={ <BillSplitterer />} />
                            <Route exact path='/Bill-Splitter/Group/:id' element={ <ViewBillspliterGroup />} />
                        </Routes>
                    </div>

                </div>
            </div>
        </>

    )
}

export default DashboardRoutes