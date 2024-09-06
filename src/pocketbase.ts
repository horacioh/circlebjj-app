import PocketBase from 'pocketbase';

export const pb = new PocketBase('https://circlebjj.pockethost.io'); // Replace with your PocketBase URL

export const getCurrentUser = () => {
  return pb.authStore.model;
};

export const collections = {
    users: 'users',
    attendances: 'attendances',
}