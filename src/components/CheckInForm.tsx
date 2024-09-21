import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAttendanceMutation, useClasses, useCurrentUser } from "../models";
import { IMAGE_URL } from "../pocketbase";

const CheckInForm: React.FC = () => {
  const location = useLocation();
  const user = useCurrentUser();
  const classes = useClasses();
  const [selectedClass, setSelectedClass] = useState("");

  console.log(`== ~ selectedClass:`, selectedClass)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const checkin = useAttendanceMutation()

  // Add this line to get the 'code' query parameter
  const code = new URLSearchParams(location.search).get('code') || '';

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        // Redirect to login and store the return path

        navigate("/login", {
          state: { from: `${location.pathname}${location.search}` },
        });
        return;
      }
    };

    fetchData();
  }, [navigate, user, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!user) {
        throw new Error("User not found");
      }

      await checkin.mutateAsync({
        code, // Use the 'code' variable here
        classId: selectedClass,
        userId: user.id
      });

      setSuccess("Check-in successful!");
      setSelectedClass("");
    } catch (error) {
      console.error("Error checking in:", error);
      setError("Failed to check in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Check-In</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-4">
          <img
            src={
              user.avatar
                ? `${IMAGE_URL}/users/${user.id}/${user.avatar}`
                : "/default-avatar.png"
            }
            alt={`${user.first_name} ${user.last_name}`}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-lg">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-gray-500 text-sm">Student</p>
          </div>
        </div>
        <div>
          <label htmlFor="class" className="block mb-1">
            Class
          </label>
          <select
            id="class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a class</option>
            {classes.data?.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading}
        >
          {isLoading ? "Checking in..." : "Confirm Check-In"}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-500 mt-4">{success}</p>}
    </div>
  );
};

export default CheckInForm;
