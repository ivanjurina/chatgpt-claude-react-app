import { useEffect, useState } from 'react';
import { CircularProgress, Button } from '@mui/material';
import { ChatHistory } from '../../types/chat';
import { chatService } from '../../services/chatService';
import { useNavigate } from 'react-router-dom';

export default function ChatOverview() {
  const [chatConversations, setChatConversations] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChatConversations();
  }, []);

  const fetchChatConversations = async () => {
    try {
      const conversations = await chatService.getChatConversations();
      setChatConversations(conversations);
    } catch (err) {
      setError('Failed to fetch chat conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const newChat = await chatService.createNewChat();
      navigate(`/chat/${newChat.id}`);
    } catch (err) {
      setError('Failed to create new chat');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="w-full max-w-screen-lg flex flex-col items-center rounded-3xl shadow-lg p-5 bg-gray-50">
      <h1 className="text-xl pb-10">Chat History</h1>
      <Button
        variant="contained"
        color="primary"
        onClick={handleNewChat}
        className="mb-6"
      >
        New Chat
      </Button>
      <div className="w-full">
        {chatConversations.map((chat) => (
          <div
            key={chat.id}
            onClick={() => navigate(`/chat/${chat.id}`)}
            className="p-4 border rounded-lg mb-2 cursor-pointer hover:bg-gray-100"
          >
            <h3 className="font-medium">{chat.title}</h3>
            <p className="text-sm text-gray-500">
              {new Date(chat.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 