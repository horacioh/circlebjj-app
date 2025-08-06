import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { useUsers, useClasses, useCreateAttendanceMutation, useUpdateAttendanceMutation } from '../models';
import { queryKeys } from '../querykeys';
import { Attendance } from '../types';

interface AttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendance?: Attendance;
  mode: 'create' | 'edit';
}

export function AttendanceDialog({ open, onOpenChange, attendance, mode }: AttendanceDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();
  const { data: users = [] } = useUsers({ pageSize: 200 });
  const { data: classes = [] } = useClasses();
  const createMutation = useCreateAttendanceMutation();
  const updateMutation = useUpdateAttendanceMutation();

  useEffect(() => {
    if (attendance && mode === 'edit') {
      setSelectedUserId(attendance.user);
      setSelectedClassId(attendance.class);
    } else {
      setSelectedUserId('');
      setSelectedClassId('');
    }
  }, [attendance, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedClassId) return;

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync({
          userId: selectedUserId,
          classId: selectedClassId,
        });
      } else if (attendance) {
        await updateMutation.mutateAsync({
          id: attendance.id,
          userId: selectedUserId,
          classId: selectedClassId,
        });
      }
      
      // Invalidate attendance queries to refresh the list
      queryClient.invalidateQueries({ queryKey: [queryKeys.ATTENDANCE_LIST] });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserDisplayName = (user: any) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) return user.first_name;
    if (user.last_name) return user.last_name;
    if (user.username) return user.username;
    return user.email || 'Unknown User';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Attendance' : 'Edit Attendance'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="user" className="block text-sm font-medium mb-2">
              User
            </label>
            <select
              id="user"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {getUserDisplayName(user)} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="class" className="block text-sm font-medium mb-2">
              Class
            </label>
            <select
              id="class"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              required
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select a class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.startHour}:{cls.startMinutes.toString().padStart(2, '0')})
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedUserId || !selectedClassId || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}