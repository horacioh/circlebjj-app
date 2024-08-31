import PocketBase from 'pocketbase';

export const pb = new PocketBase('http://127.0.0.1:8090'); // Replace with your PocketBase URL

export const getCurrentUser = () => {
  return pb.authStore.model;
};

export const collections = {
    users: 'users',
    attendances: 'attendances',
}