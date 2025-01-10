import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CircularProgress, IconButton, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ChatHistory, Message } from '../../types/chat';
import { chatService } from '../../services/chatService';
import VoiceRecorder from '../../components/common/VoiceRecorder';

export default function ChatDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const initialChatHistory = location.state?.initialChatHistory;
  const initialMessage = location.state?.initialMessage;
  
  const [chatHistory, setChatHistory] = useState<ChatHistory | null>(initialChatHistory || null);
  const [loading, setLoading] = useState(!initialChatHistory);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchChatHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await chatService.getChat(Number(id));
      setChatHistory(response);
    } catch (err) {
      setError('Failed to load chat history');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (location.state?.streaming && initialMessage) {
      handleInitialMessage();
    } else if (id) {
      fetchChatHistory();
    }
  }, [id, location.state, initialMessage, fetchChatHistory]); // Added proper dependencies

  const handleInitialMessage = async () => {
    try {
      setIsSending(true);
      let currentContent = '';
      let isComplete = false;

      // eslint-disable-next-line no-loop-func
      for await (const chunk of chatService.streamMessage(null, initialMessage)) {
        if (chunk.chatId && !id) {
          navigate(`/chat/${chunk.chatId}`, { replace: true });
        }

        currentContent += chunk.message;
        isComplete = chunk.isComplete;
        
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        // Create a stable reference to currentContent
        const content = currentContent;
        setChatHistory(prev => {
          if (!prev) return null;
          const messages = [...prev.messages];
          if (messages.length === 1) {
            messages.push({
              id: Date.now(),
              content: content,
              role: 'assistant',
              isUserMessage: false,
              createdAt: new Date().toISOString()
            });
          } else {
            messages[1] = {
              ...messages[1],
              content: content
            };
          }
          return {
            ...prev,
            id: chunk.chatId || prev.id,
            messages
          };
        });

        if (isComplete) break;
      }
    } catch (err) {
      setError('Failed to process initial message');
      console.error('Error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);
      const messageToSend = newMessage;
      setNewMessage('');

      const userMessage: Message = {
        id: Date.now(),
        content: messageToSend,
        role: 'user',
        isUserMessage: true,
        createdAt: new Date().toISOString()
      };

      setChatHistory(prev => 
        prev ? { ...prev, messages: [...prev.messages, userMessage] } : null
      );

      const aiMessageId = Date.now() + 1;
      const aiMessage: Message = {
        id: aiMessageId,
        content: '',
        role: 'assistant',
        isUserMessage: false,
        createdAt: new Date().toISOString()
      };

      setChatHistory(prev => 
        prev ? { ...prev, messages: [...prev.messages, aiMessage] } : null
      );

      let currentContent = '';

      try {
        for await (const chunk of chatService.streamMessage(id ? Number(id) : null, messageToSend)) {
          // Skip the final complete message if we already have the content
          if (chunk.isComplete && chunk.message === currentContent) {
            continue;
          }
          
          currentContent = chunk.isComplete ? chunk.message : currentContent + chunk.message;
          
          if (!id && chunk.chatId) {
            navigate(`/chat/${chunk.chatId}`, { replace: true });
            if (!chatHistory) {
              setChatHistory({
                id: chunk.chatId,
                title: messageToSend.slice(0, 50) + (messageToSend.length > 50 ? '...' : ''),
                messages: [userMessage],
                createdAt: new Date().toISOString()
              });
            }
          }

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
        }
      } catch (streamError) {
        console.error('Streaming error:', streamError);
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
        }
      }

    } catch (err) {
      setError('Failed to send message');
      console.error('Error:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  const handleChatResponse = (message: string, chatId: number, isComplete: boolean) => {
    if (!id && chatId) {
      navigate(`/chat/${chatId}`, { replace: true });
    }
    setChatHistory(prev => {
      if (!prev) return null;
      const messages = [...prev.messages];
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant' && !isComplete) {
        // Update the existing assistant message while streaming
        messages[messages.length - 1] = {
          ...lastMessage,
          content: message
        };
      } else if (isComplete) {
        // Add or update the final message
        if (lastMessage && lastMessage.role === 'assistant') {
          messages[messages.length - 1] = {
            ...lastMessage,
            content: message
          };
        } else {
          messages.push({
            id: Date.now(),
            content: message,
            role: 'assistant',
            isUserMessage: false,
            createdAt: new Date().toISOString()
          });
        }
      }
      return {
        ...prev,
        id: chatId || prev.id,
        messages
      };
    });
  };

  const handleAddUserMessage = (text: string) => {
    setChatHistory(prev => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, {
          id: Date.now(),
          content: text,
          role: 'user',
          isUserMessage: true,
          createdAt: new Date().toISOString()
        }]
      };
    });
  };

  const handleTranscriptionComplete = (text: string) => {
    console.log('Setting transcribed text:', text); // Debug log
    setNewMessage(text); // This should update the text input
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <CircularProgress />
    </div>
  );

  if (error) return (
    <div className="text-red-500 text-center">
      {error}
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]"> {/* Subtract navbar height */}
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b">
        <IconButton size="medium" onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <h1 className="text-xl font-semibold">
          {chatHistory?.title || 'New Chat'}
        </h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {chatHistory?.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-50 border border-gray-200 text-gray-900'
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans">
                {message.content}
              </pre>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(e);
        }} className="flex gap-2">
          <VoiceRecorder 
            onTranscriptionComplete={handleTranscriptionComplete}
          />
          <TextField
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(e)}
            placeholder="Type your message..."
            variant="outlined"
            disabled={isSending}
            multiline
            maxRows={4}
            size="small"
          />
          <IconButton
            type="submit"
            color="primary"
            disabled={isSending || !newMessage.trim()}
            className="self-end"
          >
            {isSending ? (
              <CircularProgress size={24} />
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </IconButton>
        </form>
      </div>
    </div>
  );
}

export {};  // Add this line to make it a module