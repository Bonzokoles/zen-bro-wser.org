/*
 * Admin Users API
 * User management endpoint
 * 
 * Endpoints:
 * GET /api/admin/users - List all users with roles
 * 
 * TODO: Add POST/PUT/DELETE for user CRUD operations
 */

import type { APIRoute } from 'astro';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'tester' | 'viewer';
}

// Mock users database
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
  },
  {
    id: '2',
    username: 'tester1',
    email: 'tester1@example.com',
    role: 'tester',
  },
  {
    id: '3',
    username: 'viewer1',
    email: 'viewer1@example.com',
    role: 'viewer',
  },
  {
    id: '4',
    username: 'tester2',
    email: 'tester2@example.com',
    role: 'tester',
  },
];

// GET - List all users
export const GET: APIRoute = async () => {
  try {
    return new Response(
      JSON.stringify({
        success: true,
        data: mockUsers,
        count: mockUsers.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch users',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
