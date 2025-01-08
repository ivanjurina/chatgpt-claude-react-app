import axios from 'axios';
import { ChatHistory, Message } from '../types/chat';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const chatService = {
  async getChats(): Promise<ChatHistory[]> {
    const response = await axios.get(`${API_URL}/api/chat`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  async getChat(id: number): Promise<ChatHistory> {
    const response = await axios.get(`${API_URL}/api/chat/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  async sendMessage(chatId: number | null, message: string): Promise<any> {
    const response = await axios.post(
      `${API_URL}/api/Chat/message?provider=chatgpt`,
      {
        message,
        chatId: chatId || null
      },
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
      `${API_URL}/api/chat/chats`,
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