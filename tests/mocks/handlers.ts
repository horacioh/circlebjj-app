import { http, HttpResponse } from 'msw';

// Mock data interfaces
interface MockUser {
  id: string;
  created: string;
  updated: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  verified: boolean;
  belt: string;
  role: string[];
  avatar: string;
  [key: string]: unknown;
}

interface MockAttendance {
  id: string;
  created: string;
  updated: string;
  user: string;
  class: string;
  code: string;
  expand?: {
    user?: MockUser;
  };
}

interface MockClass {
  id: string;
  name: string;
  created: string;
}

interface MockCheckinCode {
  id: string;
  created: string;
  updated: string;
  createdBy: string;
}

// Mock data store to simulate database state
// eslint-disable-next-line prefer-const
let mockUsers: MockUser[] = [];
// eslint-disable-next-line prefer-const
let mockAttendances: MockAttendance[] = [];
const mockClasses: MockClass[] = [
  { id: 'class1', name: 'BJJ Fundamentals', created: new Date().toISOString() },
  { id: 'class2', name: 'Advanced BJJ', created: new Date().toISOString() },
  { id: 'class3', name: 'No-Gi Grappling', created: new Date().toISOString() },
];
// eslint-disable-next-line prefer-const
let mockCheckinCodes: MockCheckinCode[] = [];

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper to simulate PocketBase response format
const createPBResponse = (items: unknown[], page = 1, perPage = 50, totalItems?: number) => ({
  page,
  perPage,
  totalItems: totalItems ?? items.length,
  totalPages: Math.ceil((totalItems ?? items.length) / perPage),
  items,
});

// Helper to create a mock user
const createMockUser = (userData: Record<string, unknown>): MockUser => ({
  id: generateId(),
  created: new Date().toISOString(),
  updated: new Date().toISOString(),
  username: String(userData.username || ''),
  first_name: String(userData.firstName || userData.first_name || ''),
  last_name: String(userData.lastName || userData.last_name || ''),
  email: String(userData.email || ''),
  verified: false,
  belt: String(userData.belt || 'white'),
  role: (userData.role as string[]) || ['member'],
  avatar: String(userData.avatar || ''),
  ...userData
});

export const handlers = [
  // User Authentication - Login
  http.post('*/api/collections/users/auth-with-password', async ({ request }) => {
    const { email, password } = await request.json() as { email: string; password: string };
    
    const user = mockUsers.find(u => u.email === email);
    
    if (!user || password !== 'TestPassword123!') {
      return HttpResponse.json(
        { message: 'Failed to authenticate.' },
        { status: 400 }
      );
    }

    // Simulate successful auth response that matches PocketBase format
    return HttpResponse.json({
      token: 'mock-jwt-token',
      record: {
        ...user,
        // Ensure role is properly formatted as PocketBase expects
        role: user.role || ['member']
      },
      meta: {}
    });
  }),

  // User Registration
  http.post('*/api/collections/users/records', async ({ request }) => {
    try {
      const formData = await request.formData();
      const userData: Record<string, unknown> = {};
      
      // Extract form data
      for (const [key, value] of formData.entries()) {
        if (key === 'avatar' && value instanceof File) {
          userData[key] = value.name;
        } else {
          userData[key] = value;
        }
      }

      // Check for duplicate email
      if (mockUsers.find(u => u.email === userData.email)) {
        return HttpResponse.json(
          { 
            data: { email: { message: 'User with this email already exists.' } }
          },
          { status: 400 }
        );
      }

      const newUser = createMockUser(userData);
      mockUsers.push(newUser);

      return HttpResponse.json(newUser, { status: 201 });
    } catch {
      return HttpResponse.json(
        { message: 'Failed to create user.' },
        { status: 400 }
      );
    }
  }),

  // Get Users List (for admin)
  http.get('*/api/collections/users/records', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('perPage') || '50');

    return HttpResponse.json(createPBResponse(mockUsers, page, perPage));
  }),

  // Get User by ID
  http.get('*/api/collections/users/records/:id', ({ params }) => {
    const user = mockUsers.find(u => u.id === params.id);
    
    if (!user) {
      return HttpResponse.json(
        { message: 'User not found.' },
        { status: 404 }
      );
    }

    return HttpResponse.json(user);
  }),

  // Update User
  http.patch('*/api/collections/users/records/:id', async ({ params, request }) => {
    const userIndex = mockUsers.findIndex(u => u.id === params.id);
    
    if (userIndex === -1) {
      return HttpResponse.json(
        { message: 'User not found.' },
        { status: 404 }
      );
    }

          const formData = await request.formData();
      const updateData: Record<string, unknown> = {};
    
    for (const [key, value] of formData.entries()) {
      if (key === 'avatar' && value instanceof File) {
        updateData[key] = value.name;
      } else {
        updateData[key] = value;
      }
    }

    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updateData,
      updated: new Date().toISOString()
    };

    return HttpResponse.json(mockUsers[userIndex]);
  }),

  // Get Classes List
  http.get('*/api/collections/classes/records', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('perPage') || '50');

    return HttpResponse.json(createPBResponse(mockClasses, page, perPage));
  }),

  // Create Check-in Code
  http.post('*/api/collections/checkin_codes/records', async ({ request }) => {
    const data = await request.json() as { createdBy: string };
    
    const newCode = {
      id: generateId(),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      createdBy: data.createdBy,
    };

    mockCheckinCodes.push(newCode);
    return HttpResponse.json(newCode, { status: 201 });
  }),

  // Get Check-in Code
  http.get('*/api/collections/checkin_codes/records/:id', ({ params }) => {
    const code = mockCheckinCodes.find(c => c.id === params.id);
    
    if (!code) {
      return HttpResponse.json(
        { message: 'Check-in code not found.' },
        { status: 404 }
      );
    }

    return HttpResponse.json(code);
  }),

  // Create Attendance
  http.post('*/api/collections/attendances/records', async ({ request }) => {
    const data = await request.json() as { code: string; user: string; class: string };
    
    // Validate check-in code exists
    const validCode = mockCheckinCodes.find(c => c.id === data.code);
    if (!validCode) {
      return HttpResponse.json(
        { message: 'Invalid check-in code.' },
        { status: 400 }
      );
    }

    const newAttendance = {
      id: generateId(),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      user: data.user,
      class: data.class,
      code: data.code,
    };

    mockAttendances.push(newAttendance);
    return HttpResponse.json(newAttendance, { status: 201 });
  }),

  // Get Attendances List
  http.get('*/api/collections/attendances/records', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('perPage') || '50');
    const filter = url.searchParams.get('filter');
    const expand = url.searchParams.get('expand');

    let filteredAttendances = [...mockAttendances];

    // Handle basic user filtering for profile view
    if (filter && filter.includes('user=')) {
      const userIdMatch = filter.match(/user="([^"]+)"/);
      if (userIdMatch) {
        const userId = userIdMatch[1];
        filteredAttendances = mockAttendances.filter(a => a.user === userId);
      }
    }

    // Handle date filtering
    if (filter && filter.includes('created>=')) {
      const dateMatch = filter.match(/created>="([^"]+)"/);
      if (dateMatch) {
        const filterDate = new Date(dateMatch[1]);
        filteredAttendances = filteredAttendances.filter(a => new Date(a.created) >= filterDate);
      }
    }

    // Handle expand for user data
    let responseAttendances = filteredAttendances;
    if (expand === 'user') {
      responseAttendances = filteredAttendances.map(attendance => ({
        ...attendance,
        expand: {
          user: mockUsers.find(u => u.id === attendance.user)
        }
      }));
    }

    return HttpResponse.json(createPBResponse(responseAttendances, page, perPage));
  }),

  // Get Stats for Dashboard
  http.get('*/api/collections/attendance_count/records', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('perPage') || '100');

    // Mock attendance counts per user
    const mockAttendanceCounts = mockUsers.map(user => ({
      id: generateId(),
      user: user.id,
      totalCount: Math.floor(Math.random() * 50) + 1,
      created: new Date().toISOString()
    }));

    return HttpResponse.json(createPBResponse(mockAttendanceCounts, page, perPage));
  }),

  // Get Check-in Counts for Charts
  http.get('*/api/collections/checkin_count/records', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('perPage') || '100');

    // Mock check-in counts for chart data
    const mockCheckinCounts = mockClasses.map(cls => ({
      id: generateId(),
      class: cls.id,
      totalCount: Math.floor(Math.random() * 100) + 10,
      year_month: new Date().toISOString().substring(0, 7),
      expand: { class: cls },
      created: new Date().toISOString()
    }));

    return HttpResponse.json(createPBResponse(mockCheckinCounts, page, perPage));
  }),

  // Admin Authentication (PocketBase admins/auth-with-password endpoint)
  http.post('*/api/admins/auth-with-password', async ({ request }) => {
    const { email, password } = await request.json() as { email: string; password: string };
    
    // Check if it's an admin user from our mock data
    const adminUser = mockUsers.find(u => u.email === email && u.role.includes('admin'));
    
    if (adminUser && password === 'AdminPassword123!') {
      return HttpResponse.json({
        token: 'mock-admin-jwt-token',
        admin: {
          id: adminUser.id,
          email: adminUser.email,
          created: adminUser.created
        }
      });
    }

    return HttpResponse.json(
      { message: 'Failed to authenticate.' },
      { status: 400 }
    );
  }),

  // Catch-all for any unhandled PocketBase requests
  http.all('*/api/*', ({ request }) => {
    console.warn(`Unhandled API request: ${request.method} ${request.url}`);
    return HttpResponse.json(
      { message: 'API endpoint not mocked.' },
      { status: 501 }
    );
  }),
];

// Export functions to manage mock data in tests
export const mockHelpers = {
  // Reset all mock data
  reset: () => {
    mockUsers.length = 0;
    mockAttendances.length = 0;
    mockCheckinCodes.length = 0;
  },

  // Add pre-configured users
  addUser: (userData: Record<string, unknown>) => {
    const user = createMockUser(userData);
    mockUsers.push(user);
    return user;
  },

  // Add admin user
  addAdminUser: (userData: Record<string, unknown>) => {
    const user = createMockUser({
      ...userData,
      role: ['admin']
    });
    mockUsers.push(user);
    return user;
  },

  // Add check-in code
  addCheckinCode: (codeData: { id?: string; createdBy: string }) => {
    const code = {
      id: codeData.id || generateId(),
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      createdBy: codeData.createdBy,
    };
    mockCheckinCodes.push(code);
    return code;
  },

  // Get mock data
  getUsers: () => mockUsers,
  getAttendances: () => mockAttendances,
  getClasses: () => mockClasses,
  getCheckinCodes: () => mockCheckinCodes,
}; 