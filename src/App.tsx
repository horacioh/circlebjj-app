import { useEffect, useState } from 'react'
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import { client, pb } from './pocketbase'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import AdminDashboard from './components/AdminDashboard'
import AdminLogin from './components/AdminLogin'
import AttendancesList from './components/AttendancesList'
import Login from './components/Login'
import MainNav from './components/MainNav'
import MemberList from './components/MemberList'
import MemberProfile from './components/MemberProfile'
import SignUp from './components/SignUp'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = pb.authStore.isValid

      setIsLoggedIn(isAuth)
      setIsAdmin(pb.authStore.isAdmin || pb.authStore.model?.role.includes('admin'))
    }

    checkAuth()
    pb.authStore.onChange(checkAuth)

    return () => {
      pb.authStore.onChange(() => {})
    }
  }, [])

  return (
    <QueryClientProvider client={client}>
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
          <Route path="/login" element={isLoggedIn ? isAdmin ? <Navigate to="/dashboard" /> : <Navigate to="/profile" /> : <Login />} />
          <Route 
            path="/admin" 
            element={<AdminLogin />} 
          />
          <Route 
            path="/profile" 
            element={isLoggedIn ? <MemberProfile /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/dashboard" 
            element={isLoggedIn && isAdmin ? <AdminDashboard /> : <Navigate to="/admin" />} 
          />
          <Route 
            path="/members" 
            element={isLoggedIn ? <MemberList /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/attendance" 
            element={isLoggedIn ? <AttendancesList /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={isLoggedIn ? <Navigate to={isAdmin ? "/dashboard" : "/profile"} />: <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
    <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
