import { useEffect, useState } from 'react';
import axios from 'axios';
import { chatService } from '../services/chatService';

interface Message {
  id: number;
  chatId: number;
  content: string;
  role: string;
  createdAt: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  isAdmin: boolean;
}

interface ChatHistory {
  id: number;
  userId: number;
  user: User;
  chatId: string;
  createdAt: string;
  messages: Message[];
}

interface ChatHistoryProps {
  chatId: string;
}

interface ChatMessage {
  message: string;
  chatId: number;
}

const ChatHistory = ({ chatId }: ChatHistoryProps) => {
  const [chatHistory, setChatHistory] = useState<ChatHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get<ChatHistory>(
          `${process.env.REACT_APP_API_URL}/api/Chat/history/${chatId}`
        );
        console.log('Fetching from:', `${process.env.REACT_APP_API_URL}/api/Chat/history/${chatId}`);
        setChatHistory(response.data);
      } catch (err) {
        setError('Failed to fetch chat history');
        console.error('Error fetching chat history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [chatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await chatService.sendMessage(Number(chatId), newMessage);
      
      // Add both user message and AI response to chat
      if (chatHistory) {
        const userMessage: Message = {
          id: Date.now(), // temporary ID
          chatId: Number(chatId),
          content: newMessage,
          role: 'user',
          createdAt: new Date().toISOString()
        };
        
        const aiMessage: Message = {
          id: Date.now() + 1, // temporary ID
          chatId: Number(chatId),
          content: response.message,
          role: 'assistant',
          createdAt: new Date().toISOString()
        };

        setChatHistory(prev => ({
          ...prev!,
          messages: [...prev!.messages, userMessage, aiMessage]
        }));
      }
      
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!chatHistory) return <div>No chat history found</div>;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex-1 overflow-y-auto">
        {chatHistory?.messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-lg mb-4 ${
              message.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
            }`}>
            <p className="text-sm text-gray-600">{message.role}</p>
            <p className="mt-1">{message.content}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(message.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending}
          className={`px-4 py-2 rounded text-white ${
            sending ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatHistory; 