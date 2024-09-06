import React, { useCallback, useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { collections, pb } from "../pocketbase";
import { Scanner } from "./Scanner";

interface DashboardStats {
  totalUsers: number;
  attendancesToday: number;
  newUsersThisMonth: number;
}

interface RecentAttendance {
  id: string;
  created: string;
  user: string;
  expand?: {
    user: {
      first_name: string;
      last_name: string;
    };
  };
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAttendances, setRecentAttendances] = useState<RecentAttendance[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const usersCount = await pb.collection(collections.users).getList(1, 1);
      const today = new Date().toISOString().split('T')[0];
      const attendancesToday = await pb.collection(collections.attendances).getList(1, 1, { filter: `created>="${today}"` });
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const newUsersThisMonth = await pb.collection(collections.users).getList(1, 1, { filter: `created >= "${firstDayOfMonth}"` });
      
      setStats({
        totalUsers: usersCount.totalItems,
        attendancesToday: attendancesToday.totalItems,
        newUsersThisMonth: newUsersThisMonth.totalItems,
      });

      const recentAttendances = await pb.collection(collections.attendances).getList<RecentAttendance>(1, 5, {
        sort: '-created',
        expand: 'user',
      });
      setRecentAttendances(recentAttendances.items);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }, []);

  async function handleUserScan(userId: string) {
    try {
      const attendance = await pb.collection(collections.attendances).create({
        user: userId,
      });
      // setRecentAttendances([attendance, ...recentAttendances]);
      console.log("Attendance recorded:", attendance);
    } catch (error) {
      console.error("Error recording attendance:", error);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const toggleScanner = () => {
    setShowScanner(true);
  };

  

  return (
    <div className="space-y-6 max-w-4xl mx-auto mt-8"> 
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold text-lg">Total Users</h3>
          <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold text-lg">Attendances Today</h3>
          <p className="text-3xl font-bold">{stats?.attendancesToday || 0}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold text-lg">New Users This Month</h3>
          <p className="text-3xl font-bold">{stats?.newUsersThisMonth || 0}</p>
        </div>
      </div>

      {/* QR Scanner */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-2">Attendance Scanner</h3>
        <button
          onClick={toggleScanner}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Scan User QR Code
        </button>
        {showScanner && (
          <Scanner onScan={(userId) => {
            if (userId) {
              handleUserScan(userId);
              setShowScanner(false);
            }
          }} />
        )}
      </div>

      {/* Recent Attendances */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-2">Recent Attendances</h3>
        <ul className="space-y-2">
          {recentAttendances.map((attendance) => (
            <li key={attendance.id} className="flex justify-between items-center">
              <span>{attendance.expand?.user ? `${attendance.expand.user.first_name} ${attendance.expand.user.last_name}` : 'Unknown User'}</span>
              <span className="text-gray-500">{new Date(attendance.created).toLocaleString()}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={() => navigate('/attendance')}
          className="mt-4 bg-gray-200 text-gray-800 px-4 py-2 rounded"
        >
          View All Attendances
        </button>
      </div>

      {/* Placeholder for Classes Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-2">Classes</h3>
        <p className="text-gray-500">Class management coming soon...</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
