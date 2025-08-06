import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { useAttendances, useDeleteAttendanceMutation, useCurrentUser } from '../models';
import { Attendance, User } from '../types';
import { Button } from './ui/button';
import { AttendanceDialog } from './AttendanceDialog';
import { queryKeys } from '../querykeys';

const AttendancesList: React.FC = () => {
  const { data: attendances = [], isLoading } = useAttendances({});
  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteAttendanceMutation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | undefined>();
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');

  const isAdmin = currentUser?.role?.includes('admin') || false;

  const handleCreateAttendance = () => {
    setEditingAttendance(undefined);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleEditAttendance = (attendance: Attendance) => {
    setEditingAttendance(attendance);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDeleteAttendance = async (attendanceId: string) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await deleteMutation.mutateAsync(attendanceId);
        queryClient.invalidateQueries({ queryKey: [queryKeys.ATTENDANCE_LIST] });
      } catch (error) {
        console.error('Error deleting attendance:', error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const filteredAttendances = attendances.filter((attendance) => {
    if (!searchTerm) return true;
    
    const user = attendance.expand?.user;
    if (!user) return false;
    
    return (
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Attendances List</h2>
        {isAdmin && (
          <Button onClick={handleCreateAttendance} className="flex items-center gap-2">
            <Plus size={16} />
            Create Attendance
          </Button>
        )}
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search user by name or email"
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:gap-1">
        {filteredAttendances.map((attendance) => (
          <AttendanceItem 
            key={attendance.id} 
            attendance={attendance}
            isAdmin={isAdmin}
            onEdit={handleEditAttendance}
            onDelete={handleDeleteAttendance}
          />
        ))}
      </div>
      
      <AttendanceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        attendance={editingAttendance}
        mode={dialogMode}
      />
    </div>
  );
};

export default AttendancesList;

interface AttendanceItemProps {
  attendance: Attendance;
  isAdmin: boolean;
  onEdit: (attendance: Attendance) => void;
  onDelete: (attendanceId: string) => void;
}

function AttendanceItem({ attendance, isAdmin, onEdit, onDelete }: AttendanceItemProps) {
  const getUserDisplayName = (user: User | undefined) => {
    if (!user) return 'Unknown User';
    
    // Try name first
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    if (user.last_name) {
      return user.last_name;
    }
    
    // Fallback to username
    if (user.username) {
      return user.username;
    }
    
    // Final fallback to email
    return user.email || 'Unknown User';
  };

  return (
    <div className="border p-4 rounded-lg shadow flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-600">{new Date(attendance.created).toLocaleString()}</p>
        <p className="font-medium">{getUserDisplayName(attendance.expand?.user)}</p>
      </div>
      {isAdmin && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(attendance)}
            className="flex items-center gap-1"
          >
            <Edit2 size={14} />
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(attendance.id)}
            className="flex items-center gap-1"
          >
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}