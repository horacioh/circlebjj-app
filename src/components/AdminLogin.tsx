import React, { useState } from 'react'
import { pb } from '../pocketbase'
import { useNavigate } from 'react-router-dom'

const AdminLogin: React.FC = () => {
    const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('');
    try {
      await pb.admins.authWithPassword(email, password)
      console.log('LOGGED IN!')
      navigate('/admin/dashboard')
    } catch (error) {
      setError('Invalid email or password');
      console.error('Error logging in:', error)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
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
        <button type="submit" className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600">
          Admin Login
        </button>
      </form>
    </div>
  )
}

export default AdminLogin