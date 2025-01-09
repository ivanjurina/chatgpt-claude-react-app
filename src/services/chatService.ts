import axios from 'axios';
import { ChatHistory } from '../types/chat';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface StreamResponse {
  message: string;
  chatId: number;
  isComplete: boolean;
  isNewChat?: boolean;
}

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
  },

  async *streamMessage(chatId: number | null, message: string) {
    const response = await fetch(`${API_URL}/api/Chat/message/stream?provider=chatgpt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        message,
        chatId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No reader available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ') && line.trim() !== 'data: ') {
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
              console.error('Failed to parse SSE data:', line, e);
            }
          }
        }
      }
    } catch (error: unknown) {
      console.error('Stream error:', error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  }
}; 