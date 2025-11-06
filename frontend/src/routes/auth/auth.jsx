import Register from '@/components/Register';
import './auth.css'
import Login from '@/components/Login';
import { useState } from 'react';


const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="auth-container bg-gray-50">
      {isLogin ? (
        <Login onSwitch={() => setIsLogin(false)} />
      ) : (
        <Register onSwitch={() => setIsLogin(true)} />
      )}
    </div>
  )
}



export default Auth;