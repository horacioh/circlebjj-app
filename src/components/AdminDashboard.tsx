import React, { useCallback, useState } from "react";

import { QrReader } from "@cmdnio/react-qr-reader";
import { useNavigate } from "react-router-dom";
import { collections, pb } from "../pocketbase";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);

  const toggleScanner = () => {
    setShowScanner(true);
  };
  const handleScan = useCallback(
    (userId: string) => {
      if (showScanner) {
        pb.collection(collections.attendances)
          .create({ user: userId })
          .then((res) => {
            console.log("ATTENDANCE CREATED", res);
            setShowScanner(false);
            // TODO: remove this hack when the reader is fixed
            window.location.reload();
          });
      }
    },
    [showScanner]
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <button
        onClick={toggleScanner}
        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
      >
        Scan User QR Code
      </button>
      <button
        onClick={() => navigate("/admin/members")}
        className="bg-green-500 text-white px-4 py-2 rounded mr-2"
      >
        View Users List
      </button>
      {showScanner ? (
        <div className="mt-4">
          <QrReader
            onResult={(result, error) => {
              if (result?.getText()) {
                const userId = result.getText();
                handleScan(userId);
              }

              if (error) {
                console.error(error);
              }
            }}
            // @ts-expect-error this prop is not defined in the component
            style={{ width: "100%" }}
          />
        </div>
      ) : null}
    </div>
  );
};

export default AdminDashboard;
