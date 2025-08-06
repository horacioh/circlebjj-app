import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup the MSW server for Node.js environment (Playwright tests)
export const server = setupServer(...handlers);

// Start server
export function startMockServer() {
  server.listen({
    onUnhandledRequest: 'warn',
  });
}

// Stop server
export function stopMockServer() {
  server.close();
}

// Reset handlers between tests
export function resetMockServer() {
  server.resetHandlers();
}

// Reset all mock data
export { mockHelpers } from './handlers'; 