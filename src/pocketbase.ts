import { QueryClient } from '@tanstack/react-query';
import PocketBase from 'pocketbase';

export const API_URL = 'https://circlebjj.fly.dev/';
export const IMAGE_URL = 'https://circlebjj.fly.dev/api/files';
export const pb = new PocketBase(API_URL); // Replace with your PocketBase URL

export const client = new QueryClient()

export const getCurrentUser = () => {
  return pb.authStore.model;
};

export const collections = {
    users: 'users',
    attendances: 'attendances',
    classes: 'classes',
    checkin_codes: 'checkin_codes',
}