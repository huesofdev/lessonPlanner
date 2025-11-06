import { AuthContext } from '@/context/AuthContext'
import React, { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router';
import AdminDashboard from './AdminDashboard';
import HodDashboard from './HodDashboard';
import LecturerDashboard from './LecturerDashboard';

const DashboardNavigator = () => {
const {user, loading, isLoggedIn} = useContext(AuthContext);
const navigate = useNavigate();

useEffect(()=> {
    if(!loading && !isLoggedIn){
   navigate("/auth")
}
}, [loading, isLoggedIn, navigate]);

if(loading){
    return <div>loading....</div>
}

const role = user?.role;

  return (
    <div>
    {role==='admin'&& <AdminDashboard/>}
    {role==='hod'&& <HodDashboard/>}
    {role==='lecturer'&& <LecturerDashboard/>}
    </div>
    
  )
}

export default DashboardNavigator