import React, { useState } from "react";
import { useUsers } from "../models";
import { User } from "../types";

type Member = User & {attendanceCount: number}

const MemberList: React.FC = () => {
  const {users, loading}  = useUsers({pageSize: 200})
  const [searchTerm, setSearchTerm] = useState("");
  // const [loading, setLoading] = useState(true);

  const filteredMembers = users.filter(
    (member) =>
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Member List</h2>
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or email"
          className="w-full p-2 border rounded"
        />
      </div>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">First Name</th>
            <th className="border p-2">Last Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Attendance Count</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.map((member) => (
            <MemberItem member={member} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MemberList;

function MemberItem({ member }: { member: Member }) {
  return (
    <tr key={member.id}>
      <td className="border p-2">{member.first_name}</td>
      <td className="border p-2">{member.last_name}</td>
      <td className="border p-2">{member.email}</td>
      <td className="border p-2">{member.attendanceCount}</td>
    </tr>
  );
}
