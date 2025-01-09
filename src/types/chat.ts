export interface Message {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
  isUserMessage?: boolean;
}

export interface ChatHistory {
  id: number;
  title: string;
  messages: Message[];
  createdAt: string;
} 