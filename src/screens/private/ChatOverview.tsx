import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, CircularProgress } from '@mui/material';
import { chatService } from '../../services/chatService';
import { ChatHistory, Message } from '../../types/chat';

const ChatOverview = () => {
  const [chatChats, setChatChats] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChatChats();
  }, []);

  const fetchChatChats = async () => {
    try {
      setLoading(true);
      const chats = await chatService.getChats();
      // Handle empty array as valid response
      setChatChats(chats || []);
    } catch (err) {
      console.error('Error fetching chats:', err);
      // Only set error for actual failures, not empty results
      if (err instanceof Error && err.message !== 'No chats found') {
        setError('Failed to fetch chat history');
      }
      setChatChats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      // Send message with null chatId to create new chat
      const response = await chatService.sendMessage(null, newMessage);
      // Navigate to the new chat
      navigate(`/chat/${response.chatId}`);
    } catch (err) {
      setError('Failed to create new chat');
    } finally {
      setIsSending(false);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNewChat(e as any);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center p-8">
      <CircularProgress />
    </div>
  );
  
  if (error) return (
    <div className="text-red-500 text-center p-8">
      {error}
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-8">
      <div className="w-full max-w-md mb-8">
        <form onSubmit={handleNewChat} className="flex flex-col gap-4">
          <TextField
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message to start a new chat..."
            variant="outlined"
            disabled={isSending}
            multiline
            rows={3}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSending || !newMessage.trim()}
            className="w-full"
          >
            {isSending ? (
              <div className="flex items-center gap-2">
                <span>Sending</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            ) : (
              'Start New Chat'
            )}
          </Button>
        </form>
      </div>

      <div className="w-full">
        {chatChats.length === 0 ? (
          <div className="text-center text-gray-500">
            No chats yet. Start a new conversation above!
          </div>
        ) : (
          chatChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              className="p-4 border rounded-lg mb-4 cursor-pointer hover:bg-gray-50 transition-colors bg-white"
            >
              <h3 className="font-medium text-lg">{chat.title || 'Untitled Chat'}</h3>
              <p className="text-sm text-gray-500">
                {new Date(chat.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatOverview; 