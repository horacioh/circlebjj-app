import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMachine } from "@xstate/react";
import { RecordModel } from "pocketbase";
import React from "react";
import { useNavigate } from "react-router-dom";
import { assign, fromPromise, setup } from "xstate";
import { collections, pb } from "../pocketbase";
import { queryKeys } from "../querykeys";
import { Scanner } from "./Scanner";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [state, send] = useMachine(
    scannerMachine.provide({
      actors: {
        processScan: fromPromise<void | Error, {userId: string}>(async ({input: {userId}}) => {
          if (userId) {
            try {
              const attendance = await pb
                .collection(collections.attendances)
                .create({
                  user: userId,
                });
              console.log("====== Attendance recorded:", attendance);
              client.invalidateQueries({
                queryKey: [queryKeys.ATTENDANCE_LIST, queryKeys.STATS],
              });
              client.invalidateQueries({
                queryKey: [
                  queryKeys.STATS,
                  queryKeys.ATTENDANCE_LIST,
                  queryKeys.USER_LIST,
                ],
              });
              alert("Attendance recorded successfully");
            } catch (error) {
              return new Error(`Error recording attendance: ${error}`);
            }
          }
          
        }),
      },
    })
  );

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: [queryKeys.STATS, queryKeys.ATTENDANCE_LIST, queryKeys.USER_LIST],
    queryFn: async () => {
      const usersCount = await pb.collection(collections.users).getList(1, 1, {
        role: pb.authStore.model?.role.includes("admin")
          ? "admin"
          : pb.authStore.model?.role.includes("coach")
          ? "coach"
          : "",
      });
      const today = new Date().toISOString().split("T")[0];
      const attendancesToday = await pb
        .collection(collections.attendances)
        .getList(1, 1, {
          filter: `created>="${today}"`,
        });
      const firstDayOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).toISOString();
      const newUsersThisMonth = await pb
        .collection(collections.users)
        .getList(1, 1, {
          filter: `created >= "${firstDayOfMonth}"`,
        });

      return {
        totalUsers: usersCount.totalItems,
        attendancesToday: attendancesToday.totalItems,
        newUsersThisMonth: newUsersThisMonth.totalItems,
      };
    },
  });

  const { data: recentAttendances } = useQuery({
    queryKey: [queryKeys.ATTENDANCE_LIST, "recent"],
    queryFn: async () => {
      return await pb.collection(collections.attendances).getList(1, 5, {
        sort: "-created",
        expand: "user",
      });
    },
  });

  if (loadingStats) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

      {/* QR Scanner */}
      <button
        onClick={() => send({ type: "OPEN_SCANNER" })}
        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
      >
        Scan User QR Code
      </button>
      {/* @ts-expect-error not sure why this is not working */}
      {state.matches("scanning") && (
        <Scanner
          onCancel={() => send({type: 'CANCEL'})}
          onScan={(userId) => {
            if (userId) {
              send({ type: "SCAN", userId: userId });
            }
          }}
        />
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 gap-4 lg:gap-1">
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

      {/* Recent Attendances */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-2">Recent Attendances</h3>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 gap-4 lg:gap-1">
            {recentAttendances?.items.map((attendance) => (
              <AttendanceItem key={attendance.id} attendance={attendance} />
            ))}
          </div>
        </div>
        <button
          onClick={() => navigate("/attendance")}
          className="mt-4 bg-gray-200 text-gray-800 px-2 py-1 rounded"
        >
          View All
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

function AttendanceItem({ attendance }: { attendance: RecordModel }) {
  return (
    <div className="border p-4 rounded-lg shadow flex flex-col lg:flex-row gap-4">
      <p>{new Date(attendance.created).toLocaleString()}</p>
      <p>
        {attendance.expand?.user
          ? `${attendance.expand.user.first_name} ${attendance.expand.user.last_name} (${attendance.expand.user.email})`
          : "Unknown User"}
      </p>
    </div>
  );
}

const scannerMachine = setup({
  types: {
    context: {
      userId: "",
    } as {
      userId: string;
    },
    events: {} as
      | {
          type: "OPEN_SCANNER";
        }
        | {
          type: "CANCEL";
        }
      | {
          type: "SCAN";
          userId: string;
        },
  },
}).createMachine({
  id: "scannerMachine",
  initial: "idle",
  context: {
    userId: "",
  },
  states: {
    idle: {
      on: {
        OPEN_SCANNER: "scanning",
      },
    },
    scanning: {
      on: {
        SCAN: {
          target: "processing",
          actions: assign({
            userId: ({event}) => {
              return event.userId;
            },
          }),
        },
        CANCEL: {
          target: 'idle'
        }
      },
    },
    processing: {
      invoke: {
        // @ts-expect-error not sure why this is not working
        id: "processScan",
        src: "processScan",
        input: ({ context }: { context: { userId: string } }) => {
          return { userId: context.userId };
        },
        onDone: {
          target: "idle",
        },
        onError: {
          target: "idle",
          actions: assign({
            error: () => "error",
          }),
        },
      },
    },
  },
});
