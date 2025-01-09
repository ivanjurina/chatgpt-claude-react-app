import axios from 'axios';
import { AuthResponseDto, LoginDto } from '../types/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const authService = {
  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
    return response.data;
  },
  
  async register(data: LoginDto): Promise<AuthResponseDto> {
    const response = await axios.post(`${API_URL}/api/auth/register`, data);
    return response.data;
  },

  async changePassword(newPassword: string): Promise<any> {
    const response = await axios.post(
      `${API_URL}/api/auth/change-password?newPassword=${newPassword}`,
      null,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
      }
    );
    return response.data;
  }
}; 