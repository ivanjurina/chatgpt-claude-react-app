export interface Message {
  id: number;
  content: string;
  isUserMessage: boolean;
  createdAt: string;
  chatId?: number;
  role?: string;
}

export interface ChatHistory {
  id: number;
  title: string;
  messages: Message[];
  createdAt: string;
} 