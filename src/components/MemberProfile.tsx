import React, { useEffect, useState } from 'react'
import { pb, getCurrentUser, collections } from '../pocketbase'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Attendance, User } from '../types'

const MemberProfile: React.FC = () => {
    const navigate = useNavigate()
  const [member, setMember] = useState<null | User>(null)
  const [attendances, setAttendances] = useState<Attendance[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const user = getCurrentUser() as User
      if (user) {
        setMember(user)
        const attendances = await pb.collection(collections.attendances).getList<Attendance>(1, 50, {
          filter: `user="${user.id}"`,
          sort: '-date',
        })
        setAttendances(attendances.items)
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
    <div>
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      <div className="mb-4">
        <p>Name: {member.first_name}</p>
        <p>Email: {member.email}</p>
      </div>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">My QR Code</h3>
        <div className='mx-auto max-w-sm flex justify-center items-center'>
        <QRCodeSVG value={member.id} size={220} />
        </div>
        
      </div>
      <h3 className="text-xl font-semibold mb-2">Attendance History</h3>
      <ul className="list-disc pl-5 mb-4">
        {attendances.map((attendance) => (
          <li key={attendance.id}>{new Date(attendance.created).toLocaleDateString()}</li>
        ))}
      </ul>
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