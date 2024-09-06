import { useEffect, useMemo, useState } from 'react';
import { collections, pb } from './pocketbase'; // Assuming you have a pocketbase instance
import { RecordModel } from 'pocketbase';

// Hook to get the current user
export const useCurrentUser = () => {
    return useMemo(() => pb.authStore.model, []);
};

// Hook to get attendances
export const useAttendances = ({pageNumber = 1, pageSize = 100}: {pageNumber?: number, pageSize?: number}) => {
    const [loading, setLoading] = useState(true);
    const [attendances, setAttendances] = useState<RecordModel[]>([]);

    useEffect(() => {
        const fetchAttendances = async () => {
            const response = await pb.collection(collections.attendances).getList(pageNumber, pageSize, {
                expand: 'user'
            }); // Fetch attendances
            setAttendances(response.items as RecordModel[]);
            setLoading(false);
        };
        fetchAttendances();
    }, [pageSize, pageNumber]);

    return {attendances, loading}; // Returns a list of attendances
};

// Hook to get users with attendance count
export const useUsers = ({pageNumber = 1, pageSize = 100}: {pageNumber?: number, pageSize?: number}) => {
    const [users, setUsers] = useState<RecordModel[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchUsers = async () => {
            const response = await pb.collection('users').getList(pageNumber, pageSize); // Fetch users
            const attendances = await pb.collection(collections.attendances).getFullList();
            const usersWithAttendance = await Promise.all(response.items.map(async (user) => {
                const attendanceCount: number = attendances.filter((attendance) => attendance.user == user.id).length;
                return { ...user, attendanceCount };
            }));
            setUsers(usersWithAttendance);
            setLoading(false);
        };
        fetchUsers();
    }, [pageSize, pageNumber]);

    return {users, loading}; // Returns a list of users with attendance count
};
