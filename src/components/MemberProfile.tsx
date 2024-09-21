import React, { useEffect, useState } from 'react'
import { pb, getCurrentUser, collections, IMAGE_URL } from '../pocketbase'
import { useNavigate } from 'react-router-dom'
import { Attendance, User } from '../types'

const MemberProfile: React.FC = () => {
    const navigate = useNavigate()
  const [member, setMember] = useState<null | User>(null)
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [totalAttendancesThisMonth, setTotalAttendancesThisMonth] = useState(0)
  const [totalAttendances, setTotalAttendances] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const user = getCurrentUser() as User
      if (user) {
        setMember(user)
        
        // Fetch last 5 attendances
        const recentAttendances = await pb.collection(collections.attendances).getList<Attendance>(1, 5, {
          filter: `user="${user.id}"`,
          sort: '-created',
        })
        setAttendances(recentAttendances.items)

        // Calculate total attendances this month
        const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
        const monthlyAttendances = await pb.collection(collections.attendances).getList(1, 1, {
          filter: `user="${user.id}" && created >= "${firstDayOfMonth}"`,
        })
        setTotalAttendancesThisMonth(monthlyAttendances.totalItems)

        // Calculate total attendances for this user
        const allAttendances = await pb.collection(collections.attendances).getList(1, 1, {
          filter: `user="${user.id}"`,
        })
        setTotalAttendances(allAttendances.totalItems)
      }
    }
    fetchData()
  }, [])

  const handleLogout = () => {
    pb.authStore.clear()
    navigate('/login')
  }

  if (!member) {
    return <Login />
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 space-y-6">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      
      {/* User Information Box */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <img src={`${IMAGE_URL}/users/${member.id}/${member.avatar}`} alt="Avatar" className="w-24 h-24 rounded-full" />
          <div>
            <h3 className="text-xl font-semibold">{member.first_name} {member.last_name}</h3>
            <p className="text-gray-600">{member.email}</p>
            <p className="text-gray-600">Role: {member.role.join(', ')}</p>
            {/* Add more user information fields as needed */}
            <p className="text-gray-600">Belt: {member.belt}</p>
            <p className="text-gray-600">Grade: {member.grade}</p>
            {member.birthdate ? <p className="text-gray-600">Birthdate: {new Date(member.birthdate).toLocaleDateString()}</p> : null}
          </div>
        </div>
      </div>

      {/* Attendance Boxes Container */}
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
        {/* Total Attendances Box */}
        <div className="bg-green-100 p-6 rounded-lg shadow flex-1">
          <h3 className="font-semibold mb-2">Total Attendances</h3>
          <p className="flex items-center space-x-3"> <span className="text-3xl font-bold">{totalAttendances}</span><span className="text-xl font-bold text-gray-500">({totalAttendances * 3} combats)</span></p>
        </div>

        {/* Total Attendances This Month Box */}
        <div className="bg-blue-100 p-6 rounded-lg shadow flex-1">
          <h3 className="font-semibold mb-2">Total Attendances This Month</h3>
          <p className="text-3xl font-bold">{totalAttendancesThisMonth}</p>
        </div>
      </div>

      {/* Recent Attendances */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Recent Attendances</h3>
        <div className="space-y-2">
          {attendances.map((attendance) => (
            <div key={attendance.id} className="flex justify-between items-center border-b pb-2">
              <span>{new Date(attendance.created).toLocaleDateString()}</span>
              <span>{new Date(attendance.created).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  )
}

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await pb.collection(collections.users).authWithPassword(email, password)
      navigate('/profile')
    } catch (error) {
      console.error('Error logging in:', error)
      setError('Invalid email or password')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Login
        </button>
      </form>
    </div>
  )
}

export default MemberProfile