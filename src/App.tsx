import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import pkg from "../package.json";
import "./App.css";
import AdminDashboard from "./components/AdminDashboard";
import AttendancesList from "./components/AttendancesList";
import CheckInForm from "./components/CheckInForm"; // Add this import
import Login from "./components/Login";
import MainNav from "./components/MainNav";
import MemberList from "./components/MemberList";
import MemberProfile from "./components/MemberProfile";
import SignupForm from "./components/SignupForm";
import { client, pb } from "./pocketbase";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = pb.authStore.isValid;

      setIsLoggedIn(isAuth);
      setIsAdmin(
        pb.authStore.isAdmin || pb.authStore.model?.role.includes("admin")
      );
      setReady(true);
    };

    console.log(`== ~ checkAuth ~ pb.authStore.model:`, pb.authStore.model);

    checkAuth();
    pb.authStore.onChange(checkAuth);

    return () => {
      pb.authStore.onChange(() => {});
    };
  }, []);

  console.log(`== ~ App ~ isLoggedIn:`, isLoggedIn);
  return ready ? (
    <QueryClientProvider client={client}>
      <Router>
        <MainNav isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
        <div className="container-lg mx-auto p-4">
          <Routes>
            <Route
              path="/login"
              element={
                isLoggedIn ? (
                  isAdmin ? (
                    <Navigate to="/dashboard" />
                  ) : (
                    <Navigate to="/profile" />
                  )
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/profile"
              element={
                isLoggedIn ? <MemberProfile /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/dashboard"
              element={
                isLoggedIn && isAdmin ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/login" state={{ from: '/dashboard' }} />
                )
              }
            />
            <Route
              path="/members"
              element={isLoggedIn ? <MemberList /> : <Navigate to="/login" state={{ from: '/members' }} />}
            />
            <Route
              path="/attendance"
              element={
                isLoggedIn ? <AttendancesList /> : <Navigate to="/login" state={{ from: '/attendance' }} />
              }
            />
            <Route
              path="/"
              element={
                isLoggedIn ? (
                  <Navigate to={isAdmin ? "/dashboard" : "/profile"} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="/signup" element={<SignupForm />} />
            <Route
              path="/check-in"
              element={<CheckInForm />}
            />
          </Routes>
          <div className="flex justify-center items-center p-20">
            <p className="text-sm text-gray-500">version: {pkg.version}</p>
          </div>
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  ) : null;
}

export default App;
