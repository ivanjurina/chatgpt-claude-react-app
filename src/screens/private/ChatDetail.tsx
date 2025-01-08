import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress, IconButton, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ChatHistory, Message } from '../../types/chat';
import { chatService } from '../../services/chatService';

export default function ChatDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState<ChatHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (id) fetchChatHistory();
  }, [id]);

  const fetchChatHistory = async () => {
    try {
      const history = await chatService.getChat(Number(id));
      setChatHistory(history);
    } catch (err) {
      setError('Failed to fetch chat history');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id) return;

    try {
      const userMessage: Message = {
        id: Date.now(),
        content: newMessage,
        isUserMessage: true,
        createdAt: new Date().toISOString()
      };

      setChatHistory(prev => 
        prev ? { ...prev, messages: [...prev.messages, userMessage] } : null
      );

      setNewMessage('');

      const response = await chatService.sendMessage(Number(id), newMessage);

      const aiMessage: Message = {
        id: Date.now() + 1,
        content: response.message,
        isUserMessage: false,
        createdAt: new Date().toISOString()
      };

      setChatHistory(prev => 
        prev ? { ...prev, messages: [...prev.messages, aiMessage] } : null
      );
    } catch (err) {
      setError('Failed to send message');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!chatHistory) return <div>Chat not found</div>;

  return (
    <div className="w-full flex max-w-[1440px] flex-col items-center px-5 pb-5 flex-1 max-h-[calc(100svh-98px)]">
      <div className="w-full flex flex-col items-center rounded-3xl shadow-lg p-5 bg-gray-100 flex-1">
        <div className="flex items-center gap-10 pb-10 w-full">
          <IconButton size="medium" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <h1 className="text-xl">{chatHistory.title}</h1>
        </div>
        
        <div className="flex-1 w-full overflow-y-auto mb-4 space-y-4 p-4">
          {chatHistory.messages.map((message: Message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg max-w-[80%] ${
                message.role === 'user' || message.isUserMessage
                  ? 'bg-blue-500 text-white ml-auto'
                  : 'bg-gray-200 mr-auto'
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="w-full flex gap-2">
          <TextField
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            variant="outlined"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export {};  // Add this line to make it a module