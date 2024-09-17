import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { pb } from '../pocketbase'

interface MainNavProps {
  isLoggedIn: boolean
  isAdmin: boolean
  setIsLoggedIn: (value: boolean) => void
  setIsAdmin: (value: boolean) => void
}

const MainNav: React.FC<MainNavProps> = ({ isLoggedIn, isAdmin, setIsLoggedIn, setIsAdmin }) => {

  console.log(`== ~ isLoggedIn, isAdmin, setIsLoggedIn, setIsAdmin:`, isLoggedIn, isAdmin)
  const navigate = useNavigate()
  const location = useLocation()

  if (!isLoggedIn) {
    return null
  }

  const handleLogout = () => {
    pb.authStore.clear()
    setIsLoggedIn(false)
    setIsAdmin(false)
    navigate('/login')
  }

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-blue-700 font-bold' : 'text-blue-500'
  }

  return isLoggedIn ? (
    <nav className="mb-4">
      <ul className="flex justify-center items-center space-x-4">
        {isAdmin ? (
          <>
            <li><Link to="/dashboard" className={`hover:underline ${isActive('/dashboard')}`}>Dashboard</Link></li>
            <li><Link to="/members" className={`hover:underline ${isActive('/members')}`}>Members</Link></li>
            <li><Link to="/attendance" className={`hover:underline ${isActive('/attendance')}`}>Attendance</Link></li>
            <li><Link to="/profile" className={`hover:underline ${isActive('/profile')}`}>Profile</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/profile" className={`hover:underline ${isActive('/profile')}`}>Profile</Link></li>
          </>
        )}
        <li>
          <button 
            onClick={handleLogout}
            className="text-red-500 hover:underline"
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  ) : null
}

export default MainNav