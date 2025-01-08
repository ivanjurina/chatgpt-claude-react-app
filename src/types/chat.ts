export interface Message {
  id: number;
  content: string;
  isUserMessage: boolean;
  timestamp: string;
}

export interface ChatHistory {
  id: number;
  title: string;
  messages: Message[];
  createdAt: string;
} 