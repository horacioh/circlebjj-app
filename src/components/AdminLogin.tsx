import React, { useState } from 'react'
import { pb } from '../pocketbase'
import { useNavigate } from 'react-router-dom'

const AdminLogin: React.FC = () => {
    const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await pb.admins.authWithPassword(email, password)
      console.log('LOGGED IN!')
      navigate('/admin/dashboard')
    } catch (error) {
      console.error('Error logging in:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Admin Email"
        className="w-full p-2 border rounded"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full p-2 border rounded"
      />
      <button type="submit" className="w-full p-2 bg-green-500 text-white rounded">
        Admin Login
      </button>
    </form>
  )
}

export default AdminLogin