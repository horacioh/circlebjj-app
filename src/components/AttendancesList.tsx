import React, { useState } from 'react';
import { useAttendances } from '../models';
import { Attendance } from '../types';

const AttendancesList: React.FC = () => {
  const { data: attendances = [], isLoading } = useAttendances({});
  
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Attendances List</h2>
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search user by name or email"
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:gap-1">
        {attendances.map((attendance) => (
          <AttendanceItem key={attendance.id} attendance={attendance} />
        ))}
      </div>
    </div>
  );
};

export default AttendancesList;

function AttendanceItem({ attendance }: { attendance: Attendance }) {
  return (
    <div className="border p-4 rounded-lg shadow">
      <p>{new Date(attendance.created).toLocaleString()}</p>
      <p>
        {attendance.expand?.user
          ? `${attendance.expand.user.first_name} ${attendance.expand.user.last_name} (${attendance.expand.user.email})`
          : 'Unknown User'}
      </p>
    </div>
  );
}