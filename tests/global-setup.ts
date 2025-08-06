import { startMockServer } from './mocks/setup';

async function globalSetup() {
  console.log('🚀 Starting Mock Service Worker for tests...');
  startMockServer();
}

export default globalSetup; 