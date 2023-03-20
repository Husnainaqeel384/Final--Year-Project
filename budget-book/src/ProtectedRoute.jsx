import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ children,path  }) => {

    let token = localStorage.getItem('token');
    if (!token || token === undefined ) {
        return <Navigate to={'/login'} />
    }
    // if(token && path ==="login")
    // {
    //     return <Navigate to={'/Dashborad'} />
    // }
    
    return (
        children?children: <Outlet />
    )
}

export default ProtectedRoute