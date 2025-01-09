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
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (id) {
      fetchChatHistory();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

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
    if (!newMessage.trim() || !id || isSending) return;

    try {
      setIsSending(true);
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

      const aiMessageId = Date.now() + 1;
      const aiMessage: Message = {
        id: aiMessageId,
        content: '',
        isUserMessage: false,
        createdAt: new Date().toISOString()
      };

      setChatHistory(prev => 
        prev ? { ...prev, messages: [...prev.messages, aiMessage] } : null
      );

      let currentContent = '';
      let isComplete = false;
      let hasError = false;

      try {
        for await (const chunk of chatService.streamMessage(Number(id), newMessage)) {
          if (hasError) {
            // If we get here after an error, we've successfully reconnected
            hasError = false;
          }

          currentContent += chunk.Message;
          isComplete = chunk.IsComplete;

          // Use requestAnimationFrame for smoother updates
          await new Promise(resolve => requestAnimationFrame(resolve));
          
          setChatHistory(prev => {
            if (!prev) return null;
            return {
              ...prev,
              messages: prev.messages.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, content: currentContent }
                  : msg
              )
            };
          });

          if (isComplete) break;
        }
      } catch (streamError) {
        console.error('Streaming error:', streamError);
        hasError = true;
        
        // Only show error if we didn't get any content
        if (!currentContent) {
          setChatHistory(prev => {
            if (!prev) return null;
            return {
              ...prev,
              messages: prev.messages.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, content: 'Error: Failed to load response. Please try again.' }
                  : msg
              )
            };
          });
        } else {
          // If we have partial content, indicate it's incomplete
          setChatHistory(prev => {
            if (!prev) return null;
            return {
              ...prev,
              messages: prev.messages.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, content: currentContent + ' [Message interrupted. Refresh to see complete response.]' }
                  : msg
              )
            };
          });
        }
      }

    } catch (err) {
      setError('Failed to send message');
      console.error('Error:', err);
    } finally {
      setIsSending(false);
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
          {isSending && (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="w-full flex gap-2">
          <TextField
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            variant="outlined"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending}
            className={`px-6 py-2 rounded text-white ${
              isSending ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isSending ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}

export {};  // Add this line to make it a module