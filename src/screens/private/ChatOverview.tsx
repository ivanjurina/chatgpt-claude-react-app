import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, IconButton, CircularProgress, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { chatService } from '../../services/chatService';
import VoiceRecorder from '../../components/common/VoiceRecorder';

interface StreamResponse {
  chatId?: number;
  message?: string;
  isComplete?: boolean;
}

export default function ChatOverview() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await chatService.getChats();
      setChats(response);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const stream = await chatService.streamMessage(null, newMessage);
      let chatId: number | null = null;
      let messageContent = '';

      for await (const chunk of stream) {
        if (chunk.chatId && !chatId) {
          chatId = chunk.chatId;
        }
        if (chunk.message) {
          messageContent = chunk.message;
        }
        if (chunk.isComplete && chatId) {
          await new Promise(resolve => setTimeout(resolve, 100));
          navigate(`/chat/${chatId}`, { replace: true });
          break;
        }
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    } finally {
      setSending(false);
      setNewMessage('');
      setShowNewChat(false);
    }
  };

  const handleTranscriptionComplete = (text: string) => {
    setNewMessage(text);
    setShowNewChat(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chats</h1>
        <div className="flex gap-2">
          <VoiceRecorder 
            onTranscriptionComplete={handleTranscriptionComplete}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowNewChat(true)}
          >
            New Chat
          </Button>
        </div>
      </div>

      {showNewChat && (
        <form onSubmit={handleNewChat} className="mb-4">
          <div className="flex gap-2">
            <TextField
              fullWidth
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message to start a new chat..."
              variant="outlined"
              disabled={sending}
              multiline
              maxRows={4}
              size="small"
              autoFocus
            />
            <IconButton
              type="submit"
              color="primary"
              disabled={sending || !newMessage.trim()}
              className="self-end"
            >
              {sending ? (
                <CircularProgress size={24} />
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </IconButton>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => navigate(`/chat/${chat.id}`)}
            className="p-4 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-50"
          >
            <div className="font-medium">{chat.title || 'Untitled Chat'}</div>
            <div className="text-sm text-gray-500">
              {new Date(chat.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 