import { useEffect, useState } from "react";
import pkg from "../package.json";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import { client, pb } from "./pocketbase";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import AdminDashboard from "./components/AdminDashboard";
import AdminLogin from "./components/AdminLogin";
import AttendancesList from "./components/AttendancesList";
import Login from "./components/Login";
import MainNav from "./components/MainNav";
import MemberList from "./components/MemberList";
import MemberProfile from "./components/MemberProfile";
import SignupForm from "./components/SignupForm";
import CheckInForm from "./components/CheckInForm"; // Add this import

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
            <Route path="/admin" element={<AdminLogin />} />
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
                  <Navigate to="/admin" />
                )
              }
            />
            <Route
              path="/members"
              element={isLoggedIn ? <MemberList /> : <Navigate to="/login" />}
            />
            <Route
              path="/attendance"
              element={
                isLoggedIn ? <AttendancesList /> : <Navigate to="/login" />
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
              element={isLoggedIn ? <CheckInForm /> : <Navigate to="/login" />}
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
