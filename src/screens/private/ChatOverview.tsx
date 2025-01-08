import { useEffect, useState } from 'react';
import { CircularProgress, Button, TextField } from '@mui/material';
import { ChatHistory } from '../../types/chat';
import { chatService } from '../../services/chatService';
import { useNavigate } from 'react-router-dom';

export default function ChatOverview() {
  const [chatChats, setChatChats] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChatChats();
  }, []);

  const fetchChatChats = async () => {
    try {
      const chats = await chatService.getChats();
      setChatChats(chats);
    } catch (err) {
      setError('Failed to fetch chat chats');
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim() || isCreating) return;

    try {
      setIsCreating(true);
      // Send message with null chatId to create new chat
      const response = await chatService.sendMessage(null, newChatMessage);
      // Navigate to the new chat
      navigate(`/chat/${response.chatId}`);
    } catch (err) {
      setError('Failed to create new chat');
    } finally {
      setIsCreating(false);
      setNewChatMessage('');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="w-full max-w-screen-lg flex flex-col items-center rounded-3xl shadow-lg p-5 bg-gray-50">
      <h1 className="text-xl pb-10">Chat History</h1>
      
      <form onSubmit={handleNewChat} className="w-full max-w-md mb-6 flex flex-col gap-2">
        <TextField
          fullWidth
          value={newChatMessage}
          onChange={(e) => setNewChatMessage(e.target.value)}
          placeholder="Type your message to start a new chat..."
          variant="outlined"
          disabled={isCreating}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isCreating || !newChatMessage.trim()}
          className="w-full"
        >
          {isCreating ? 'Creating...' : 'Start New Chat'}
        </Button>
      </form>

      <div className="w-full">
        {chatChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => navigate(`/chat/${chat.id}`)}
            className="p-4 border rounded-lg mb-2 cursor-pointer hover:bg-gray-100"
          >
            <h3 className="font-medium text-lg">{chat.title || 'Untitled Chat'}</h3>
            <p className="text-sm text-gray-500">
              {new Date(chat.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
} 