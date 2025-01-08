import axios from 'axios';
import { ChatHistory, Message } from '../types/chat';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const chatService = {
  async getChatConversations(): Promise<ChatHistory[]> {
    const response = await axios.get(`${API_URL}/api/chat/conversations`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  async getChatHistory(id: number): Promise<ChatHistory> {
    const response = await axios.get(`${API_URL}/api/chat/conversations/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  async sendMessage(historyId: number, content: string): Promise<Message> {
    const response = await axios.post(
      `${API_URL}/api/chat/conversations/${historyId}/messages`,
      { content },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  async createNewChat(): Promise<ChatHistory> {
    const response = await axios.post(
      `${API_URL}/api/chat/conversations`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  }
}; 