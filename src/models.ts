import { useQuery } from "@tanstack/react-query";
import { collections, pb } from "./pocketbase"; // Assuming you have a pocketbase instance
import { queryKeys } from "./querykeys";
import { Attendance, User } from "./types";

// Hook to get the current user
export const useCurrentUser = () => {
  return pb.authStore.model; // No need for React Query here
};

// Hook to get attendances
export const useAttendances = ({
  pageNumber = 1,
  pageSize = 100,
}: {
  pageNumber?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: [queryKeys.ATTENDANCE_LIST, pageNumber, pageSize],
    queryFn: async () => {
      const response = await pb
        .collection<Attendance>(collections.attendances)
        .getList(pageNumber, pageSize, {
          expand: "user",
          sort: '-created',
        });
      return response.items;
    },
  });
};

// Hook to get users with attendance count
export const useUsers = ({
  pageNumber = 1,
  pageSize = 100,
}: {
  pageNumber?: number;
  pageSize?: number;
}) => {
  return useQuery({
    queryKey: [queryKeys.USER_LIST, pageNumber, pageSize],
    queryFn: async () => {
      const response = await pb
        .collection(collections.users)
        .getList(pageNumber, pageSize);

      const firstDayOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).toISOString();
      const attendances = await pb
        .collection(collections.attendances)
        .getFullList({
          filter: `created >= "${firstDayOfMonth}"`,
        });
      // @ts-expect-error the expand is typed
      const usersWithAttendance: Array<
        User
      > = await Promise.all(
        response.items.map(async (user) => {
          const attendanceCount: number = attendances.filter(
            (attendance) => attendance.user == user.id
          ).length;
          return { ...user, attendanceCount };
        })
      );
      return usersWithAttendance;
    },
  });
};
