import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export interface User {
  id: number;
  username: string;
  email?: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface ChangePasswordRequest {
  newPassword: string;
}

export const authService = {
  async login({ username, password }: LoginRequest): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>(
      `${API_URL}/api/auth/login`,
      { username, password },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },

  async changePassword(newPassword: string): Promise<void> {
    await axios.post(
      `${API_URL}/api/auth/change-password`,
      { newPassword } as ChangePasswordRequest,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
  },

  // Add other auth-related methods as needed
}; 