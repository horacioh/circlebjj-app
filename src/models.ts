import { useMutation, useQuery } from "@tanstack/react-query";
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
          sort: "-created",
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

      const attendanceCounts = await pb.collection(collections.attendance_count).getList(1, 100);
      // @ts-expect-error the expand is typed
      const usersWithAttendance: Array<User> = await Promise.all(
        response.items.map(async (user) => {
          return { ...user, attendanceCount: attendanceCounts.items.find(ac => ac.user === user.id)?.totalCount || 0 };
        })
      );
      return usersWithAttendance;
    },
  });
};

interface Class {
  id: string;
  name: string;
  startHour: number;
  startMinutes: number;
}

export function useClasses() {
  return useQuery({
    queryKey: [queryKeys.CLASS_LIST],
    queryFn: async () => {
      const filter = getClassFilter();
      const response = await pb
        .collection(collections.classes)
        .getList<Class>(1, 50, {
          sort: "startHour",
          filter,
        });
      return response.items;
    },
  });
}

function getClassFilter({
  date = new Date(),
  hourOffset = 2,
}: {
  date?: Date;
  hourOffset?: number;
} = {}) {
  const dayOfWeek = date.getDay();
  const currentHour = date.getHours();
  return `day = "${dayOfWeek}" && startHour >= ${
    currentHour - hourOffset
  } && startHour <= ${currentHour + hourOffset}`;
}

export function useAttendanceMutation() {
  return useMutation({
    mutationFn: async ({
      code,
      classId,
      userId,
    }: {
      code: string;
      classId: string;
      userId: string;
    }) => {
      const validCode = await pb
        .collection(collections.checkin_codes)
        .getOne(code);
      if (!validCode || !classId || !userId) {
        return new Error(
          `Mutation Error: ${JSON.stringify({ code, classId, userId })}`
        );
      } else {
        const response = await pb.collection(collections.attendances).create({
          user: userId,
          class: classId,
          code,
        });
        return response;
      }
    },
  });
}

export interface CheckinCount {
  id: string;
  name: Class['name'];
  year_month: string;
  count: number;
}



export function useCheckinCount() {
  return useQuery({
    queryKey: [queryKeys.CHECKIN_COUNT],
    queryFn: async () => {
      try {
        const records = await pb
          .collection<CheckinCount>(collections.checkin_count)
          .getList(1, 100, {
            expand: 'class'
          });
        return [
          {
            label: 'Classes',
            data: records.items.map(item => ({
              id: item.id,
              name: item.expand?.class.name,
              count: item.totalCount,
              year_month: item.year_month
            }))
          }
        ];
      } catch (error) {
        console.error(error);
        return []
      }
    },
  });
}
