import React from 'react'
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
import UpdateExpense from './Pages/UpdateExpense'
import UpdateCategory from './Pages/UpdateCategory'
import Report from './Pages/Report'


const DashboardRoutes = () => {
    const { activeMenu } = useStateContext();


    return (
        <>
            <div className='flex relative' >
                {
                    activeMenu ?
                        (<>
                            <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white ">
                                <Sidebar />
                            </div>
                        </>)
                        :
                        (<>
                            <div className="w-0 dark:bg-secondary-dark-bg">
                                <Sidebar />
                            </div>
                        </>)
                }
                <div className={`dark:bg-main-bg bg-main-bg min-h-screen w-full 
                    ${activeMenu ? 'md:ml-72' : 'flex-2'}`}>
                    <div className='fixed md:static bg-main-bg navbar w-full navbarshadow'>
                        <DashboardNavbar />

                    </div>

                    <div>
                        <Routes>
                            <Route index element={<MainDashboard />} />
                            <Route exact path='new' element={<NewBudget />} />
                            <Route exact path='current' element={<CurrentBudget />} />
                            <Route exact path='all-budgets' element={<ALLBudgtes />} />
                            <Route exact path='users' element={<Users />} />
                            <Route exact path='Add-Expenses' element={<Expense />} />
                            <Route exact path='/Budget-detail' element={ <BudgetDetail/> } />
                            <Route exact path='/User-profile' element={ <Profile /> } />
                            <Route exact path='/update-user-profile' element={ <UpdateUserProfile /> } />
                            <Route exact path='/change-password' element={ <ChangePassword /> } />
                            <Route exact path='/daily-reminder' element={ <DailReminder /> } />
                            <Route exact path='/transactions' element={ <Transcation /> } />
                            <Route exact path='/Edit-Expense' element={ <UpdateExpense /> } />
                            <Route exact path='/report' element={ <Report /> } />
                            <Route exact path='//Update-Category-Value' element={ <UpdateCategory /> } />
                        </Routes>
                    </div>

                </div>
            </div>
        </>

    )
}

export default DashboardRoutes