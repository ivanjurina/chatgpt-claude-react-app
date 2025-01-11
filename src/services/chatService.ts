import axios from 'axios';
import { ChatHistory } from '../types/chat';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface PaginatedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  firstItemIndex: number;
  lastItemIndex: number;
  hasItems: boolean;
}

interface Chat {
  id: number;
  title: string;
  createdAt: string;
}

interface StreamResponse {
  chatId?: number;
  message?: string;
  isComplete?: boolean;
}

export const chatService = {
  async getChats(pageNumber: number = 1, pageSize: number = 5): Promise<PaginatedResult<Chat>> {
    const response = await fetch(
      `${API_URL}/api/chat/chats?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch chats');
    }

    return response.json();
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
  },

  async *streamMessage(chatId: number | null, message: string): AsyncGenerator<StreamResponse> {
    const response = await fetch(
      `${API_URL}/api/chat/message/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          chatId,
          message
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const jsonData = line.replace('data: ', '').trim();
              if (jsonData && jsonData !== '[DONE]') {
                const data: StreamResponse = JSON.parse(jsonData);
                yield data;

                if (data.isComplete) {
                  return;
                }
              }
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
};

export type { PaginatedResult, Chat, StreamResponse }; 