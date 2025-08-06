import { stopMockServer } from './mocks/setup';

async function globalTeardown() {
  console.log('🛑 Stopping Mock Service Worker...');
  stopMockServer();
}

export default globalTeardown; 