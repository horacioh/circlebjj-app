import React, { useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode.react"; // You'll need to install this package

interface MainNavProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
}

const MainNav: React.FC<MainNavProps> = ({ isLoggedIn, isAdmin }) => {
  const [showQR, setShowQR] = useState(false);

  if (!isLoggedIn) {
    return null;
  }

  const isActive = (path: string) => {
    return window.location.pathname === path
      ? "text-blue-700 font-bold"
      : "text-blue-500";
  };

  return isLoggedIn ? (
    <nav className="bg-gray-200 py-4 px-6">
      <div className="container-lg mx-auto">
        <ul className="flex flex-col sm:flex-row justify-between items-center">
          <li className="mb-4 sm:mb-0">
            <Link to="/" className="text-xl font-bold">
              Circle App
            </Link>
          </li>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <li>
              <Link
                to="/profile"
                className={`hover:text-blue-300 ${isActive("/profile")}`}
              >
                Profile
              </Link>
            </li>
            {isAdmin ? (
              <>
                <li>
                  <Link
                    to="/dashboard"
                    className={`hover:text-blue-300 ${isActive("/dashboard")}`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/members"
                    className={`hover:text-blue-300 ${isActive("/members")}`}
                  >
                    Members
                  </Link>
                </li>
                <li>
                  <Link
                    to="/attendance"
                    className={`hover:text-blue-300 ${isActive("/attendance")}`}
                  >
                    Attendance
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setShowQR(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Show QR
                  </button>
                </li>
              </>
            ) : null}
          </div>
        </ul>
      </div>
      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg">
            <QRCode value="https://your-qr-code-data-here.com" size={256} />
            <button
              onClick={() => setShowQR(false)}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </nav>
  ) : null;
};

export default MainNav;
