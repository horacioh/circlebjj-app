import React, { useState, useEffect } from 'react';
import { pb, getCurrentUser, collections } from '../pocketbase';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';

interface Class {
  id: string;
  name: string;
}

const CheckInForm: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = getCurrentUser() as User;
      if (!user) {
        // Redirect to login and store the return path
        sessionStorage.setItem('returnPath', '/check-in');
        navigate('/login');
        return;
      }
      setCurrentUser(user);

      try {
        // Fetch available classes from the PocketBase "classes" collection
        const classesResult = await pb.collection(collections.classes).getList<Class>(1, 50, {
          sort: 'name',
        });
        setClasses(classesResult.items);
      } catch (error) {
        if (classes.length == 0) {
          console.error('Error fetching classes:', error);
        } else {
          setError('');
        }
      }
    };

    fetchData();
  }, [navigate, classes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!currentUser) {
        throw new Error('User not found');
      }

    //   const attendance = await pb.collection(collections.attendances).create({
    //     user: currentUser.id,
    //     class: selectedClass,
    //   });

      setSuccess('Check-in successful!');
      setSelectedClass('');
    } catch (error) {
      console.error('Error checking in:', error);
      setError('Failed to check in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Check-In</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="userId" className="block mb-1">User ID</label>
          <input
            id="userId"
            type="text"
            value={currentUser.id}
            readOnly
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>
        <div>
          <label htmlFor="class" className="block mb-1">Class</label>
          <select
            id="class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading}
        >
          {isLoading ? 'Checking in...' : 'Confirm Check-In'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">{success}</p>}
    </div>
  );
};

export default CheckInForm;