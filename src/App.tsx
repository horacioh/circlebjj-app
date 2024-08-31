import { useEffect, useState } from 'react'
import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom'
import './App.css'
import { pb } from './pocketbase'

import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import MemberList from './components/MemberList'
import AttendancesList from './components/AttendancesList'
import MemberProfile from './components/MemberProfile'
import SignUp from './components/SignUp'
import Login from './components/Login'
import MainNav from './components/MainNav'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = pb.authStore.isValid
      setIsLoggedIn(isAuth)
      setIsAdmin(pb.authStore.isAdmin)
    }

    checkAuth()
    pb.authStore.onChange(checkAuth)

    return () => {
      pb.authStore.onChange(() => {})
    }
  }, [])

  return (
    <Router>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4 text-center">CircleBJJ app</h1>
        <MainNav 
          isLoggedIn={isLoggedIn} 
          isAdmin={isAdmin} 
          setIsLoggedIn={setIsLoggedIn} 
          setIsAdmin={setIsAdmin}
        />
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/profile" 
            element={isLoggedIn ? <MemberProfile /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={isAdmin ? <Navigate to="/admin/dashboard" /> : <AdminLogin />} 
          />
          <Route 
            path="/admin/dashboard" 
            element={isAdmin ? <AdminDashboard /> : <Navigate to="/admin" />} 
          />
          <Route 
            path="/admin/members" 
            element={isAdmin ? <MemberList /> : <Navigate to="/admin" />} 
          />
          <Route 
            path="/admin/attendance" 
            element={isAdmin ? <AttendancesList /> : <Navigate to="/admin" />} 
          />
          <Route 
            path="/" 
            element={isLoggedIn ? <h2>Welcome to CircleBJJ</h2> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
