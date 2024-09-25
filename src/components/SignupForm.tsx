import React, { useState } from 'react';
import { collections, pb } from '../pocketbase';
import { useNavigate } from 'react-router-dom';

const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    belt: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const record = await pb.collection(collections.users).create({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        first_name: formData.firstName,
        last_name: formData.lastName,
        belt: formData.belt || undefined,
        role: 'member',
      });
      console.log('User created:', record);
      // Redirect or show success message
      navigate('/login')
    } catch (error) {
      console.error('Error creating user:', error);
      // Show error message to user
    }
  };

  return (
    
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Username"
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        placeholder="First Name"
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        placeholder="Last Name"
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        required
        className="w-full p-2 border rounded"
      />
      <input
        type="password"
        name="passwordConfirm"
        value={formData.passwordConfirm}
        onChange={handleChange}
        placeholder="Confirm Password"
        required
        className="w-full p-2 border rounded"
      />
      <select
        name="belt"
        value={formData.belt}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="">Select Belt</option>
        <option value="white">White</option>
        <option value="blue">Blue</option>
        <option value="purple">Purple</option>
        <option value="brown">Brown</option>
        <option value="black">Black</option>
      </select>
      <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">Sign Up</button>
    </form>
    
  );
};

export default SignupForm;