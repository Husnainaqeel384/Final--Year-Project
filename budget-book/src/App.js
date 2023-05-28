import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './Components/Home/Home';
import Login from './Components/Layout/Login';
import Register from './Components/Layout/Register';
import ForgotPassword from './Components/Layout/ForgotPassword';
import RecoveryPassword from './Components/Layout/ResetPassword';
import DashboardRoutes from './Components/Dashborad/DashboardRoutes';
import  { Toaster } from 'react-hot-toast';
import {ToastContainer} from 'react-toastify';
import ProtectedRoute from './ProtectedRoute';
import About from './Components/Layout/About';
import Policy from './Components/Layout/Policy';
import Contact from './Components/Layout/Contact';
function App() {
  return (
    <Router >
      <Routes>
        <Route path='/' element={<Home />}></Route>
        
        <Route path='/login' element={ 
        // <ProtectedRoute path="login">
          <Login />
        // </ProtectedRoute> 
      }/>
        <Route path='/register' element={<Register />}></Route>
        <Route path='/about' element={<About />}></Route>
        <Route path='/privacy-policy' element={<Policy />}></Route>
        <Route path='/contact' element={<Contact />}></Route>
        <Route path='/forgot-password' element={<ForgotPassword />}></Route>
        <Route path='/reset-password/:token' element={<RecoveryPassword />}></Route>
        <Route element={<ProtectedRoute />}>
   
          <Route path='/Budget/*' element={<DashboardRoutes />}/>
        </Route>
        <Route path='/*' element={<Home />}></Route>
      </Routes>
      <Toaster />
      <ToastContainer />

    </Router>

  );
}

export default App;
