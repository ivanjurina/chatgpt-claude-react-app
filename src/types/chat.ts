export interface Message {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  isUserMessage: boolean;
  createdAt: string;
}

export interface ChatHistory {
  id?: number;
  title?: string;
  messages: Message[];
  createdAt?: string;
} 