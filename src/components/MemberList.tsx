import React, { useState } from "react";
import { useUsers } from "../models";
import { User } from "../types";

const MemberList: React.FC = () => {
  const { data: users = [], isLoading } = useUsers({ pageSize: 200 });

  console.log(`== ~ users:`, users)
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const filteredMembers = users.filter(
    (member) =>
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="grid grid-cols-1 gap-4 lg:gap-1">
        {filteredMembers.map((member) => (
          <MemberItem key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
};

export default MemberList;

function MemberItem({ member }: { member: User }) {
  return (
    <div className="border p-4 rounded-lg shadow">
      <h3 className="font-semibold">{member.first_name} {member.last_name}</h3>
      <p>{member.email}</p>
      <p>Attendance this month: {member.attendanceCount}</p>
    </div>
  );
}
