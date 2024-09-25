import React, { useState, useRef } from 'react';
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (avatarFile) {
        data.append('avatar', avatarFile);
      }
      data.append('role', 'member');

      const record = await pb.collection(collections.users).create(data);
      console.log('User created:', record);
      // Redirect or show success message
      navigate('/login')
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to sign up. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
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
      <div>
        <label className="block mb-1">Avatar</label>
        <div 
          onClick={handleAvatarClick}
          className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center cursor-pointer"
        >
          {avatarFile ? (
            <img 
              src={URL.createObjectURL(avatarFile)} 
              alt="Avatar preview" 
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="text-gray-500">Add Avatar</span>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
      </div>
      <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">Sign Up</button>
    </form>
  );
};

export default SignupForm;