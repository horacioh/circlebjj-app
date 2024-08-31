import React, { useState, useEffect } from 'react';
import { collections, pb } from '../pocketbase';

interface Attendance {
  id: string;
  user: string;
  created: string;
  expand?: {
    user: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const AttendancesList: React.FC = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersResult = await pb.collection(collections.users).getList<User>(1, 100, {
          sort: 'first_name',
        });
        setUsers(usersResult.items);

        const attendancesResult = await pb.collection(collections.attendances).getList<Attendance>(1, 100, {
          sort: '-created',
          expand: 'user',
        });
        setAttendances(attendancesResult.items);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter(user => 
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAttendances = selectedUser

    
    ? attendances.filter(attendance => attendance.user === selectedUser.id)
    : attendances;
    
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSearchTerm(`${user.first_name} ${user.last_name}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  console.log(`== ~ filteredAttendances:`, filteredAttendances)

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Attendances List</h2>
      <div className="mb-4 relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSelectedUser(null);
          }}
          placeholder="Search user by name or email"
          className="w-full p-2 border rounded"
        />
        {searchTerm && !selectedUser && (
          <ul className="absolute z-10 w-full bg-white border rounded mt-1 max-h-60 overflow-auto">
            {filteredUsers.map((user) => (
              <li
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className="p-2 hover:bg-gray-100 cursor-pointer"
              >
                {user.first_name} {user.last_name} ({user.email})
              </li>
            ))}
          </ul>
        )}
      </div>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Date</th>
            <th className="border p-2">User</th>
          </tr>
        </thead>
        <tbody>
          {filteredAttendances.map((attendance) => (
            <tr key={attendance.id}>
              <td className="border p-2">{new Date(attendance.created).toLocaleString()}</td>
              <td className="border p-2">
                {attendance.expand?.user
                  ? `${attendance.expand.user.first_name} ${attendance.expand.user.last_name} (${attendance.expand.user.email})`
                  : 'Unknown User'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttendancesList;