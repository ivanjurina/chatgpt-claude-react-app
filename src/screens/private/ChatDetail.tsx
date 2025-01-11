import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  TextField, 
  IconButton, 
  CircularProgress, 
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { chatService } from '../../services/chatService';
import { documentService, type Document } from '../../services/documentService';
import VoiceRecorder from '../../components/common/VoiceRecorder';
import { type ChatHistory, type Message } from '../../types/chat';

const DRAWER_WIDTH = 300;

export default function ChatDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState<ChatHistory | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialMessage = location.state?.message as string;
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchChatHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state
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
      handleInitialMessage(initialMessage);
    } else if (id) {
      fetchChatHistory();
    }
  }, [id, location.state, initialMessage, fetchChatHistory]);

  const handleInitialMessage = async (initialMessage: string) => {
    try {
      let currentContent = '';
      let isComplete = false;

      for await (const chunk of chatService.streamMessage(null, initialMessage)) {
        if (chunk.message) {
          currentContent += chunk.message;
        }
        isComplete = chunk.isComplete ?? false;
        
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        setChatHistory((prev: ChatHistory | null) => {
          if (!prev) return null;
          const messages = [...prev.messages];
          const lastMessage = messages[messages.length - 1];
          
          if (lastMessage && lastMessage.role === 'assistant') {
            messages[messages.length - 1] = {
              ...lastMessage,
              content: currentContent
            };
          } else {
            messages.push({
              id: Date.now(),
              content: currentContent,
              role: 'assistant',
              isUserMessage: false,
              createdAt: new Date().toISOString()
            });
          }
          
          return {
            ...prev,
            messages
          };
        });

        if (isComplete) {
          break;
        }
      }
    } catch (error) {
      console.error('Error handling initial message:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const messageToSend = newMessage;
    setNewMessage('');
    setIsSending(true);

    try {
      // Add user message immediately
      setChatHistory((prev: ChatHistory | null) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, {
            id: Date.now(),
            content: messageToSend,
            role: 'user',
            isUserMessage: true,
            createdAt: new Date().toISOString()
          }]
        };
      });

      let currentContent = '';

      for await (const chunk of chatService.streamMessage(id ? Number(id) : null, messageToSend)) {
        if (chunk.message) {
          currentContent = chunk.isComplete ? 
            (chunk.message || '') : 
            (currentContent + (chunk.message || ''));
          
          if (!id && chunk.chatId) {
            navigate(`/chat/${chunk.chatId}`, { replace: true });
          }

          setChatHistory((prev: ChatHistory | null) => {
            if (!prev) return null;
            const messages = [...prev.messages];
            const lastMessage = messages[messages.length - 1];
            
            if (lastMessage && lastMessage.role === 'assistant') {
              messages[messages.length - 1] = {
                ...lastMessage,
                content: currentContent
              };
            } else {
              messages.push({
                id: Date.now(),
                content: currentContent,
                role: 'assistant',
                isUserMessage: false,
                createdAt: new Date().toISOString()
              });
            }
            
            return {
              ...prev,
              id: chunk.chatId || prev.id,
              messages
            };
          });

          await new Promise(resolve => requestAnimationFrame(resolve));
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
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

  useEffect(() => {
    if (id) {
      fetchDocuments();
    }
  }, [id]);

  const fetchDocuments = async () => {
    if (!id) return;
    try {
      const docs = await documentService.getChatDocuments(Number(id));
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;

    try {
      setIsUploading(true);
      await documentService.uploadDocument(file, Number(id));
      await fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDocumentDownload = async (documentId: number) => {
    try {
      await documentService.downloadDocument(documentId);
    } catch (error) {
      console.error('Error downloading document:', error);
      // You might want to show an error message to the user here
    }
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
    <div className="flex h-[calc(100vh-64px)] bg-[#F3F4F6]">
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            top: 64,
            height: 'calc(100% - 64px)'
          },
        }}
      >
        <div className="p-4">
          <Typography variant="h6" className="mb-4">
            Documents
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AttachFileIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            fullWidth
          >
            {isUploading ? 'Uploading...' : 'Upload PDF'}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="application/pdf"
            className="hidden"
          />
        </div>
        <Divider />
        <List>
          {documents.map((doc) => (
            <ListItem 
              key={doc.id}
              button
              onClick={() => handleDocumentDownload(doc.id)}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <ListItemIcon>
                <DescriptionIcon />
              </ListItemIcon>
              <ListItemText 
                primary={doc.fileName}
                secondary={new Date(doc.uploadedAt).toLocaleDateString()}
              />
            </ListItem>
          ))}
          {documents.length === 0 && (
            <ListItem>
              <ListItemText 
                primary="No documents"
                secondary="Upload a PDF to get started"
              />
            </ListItem>
          )}
        </List>
      </Drawer>

      <div className="flex flex-col flex-1">
        <div className="bg-white shadow-md">
          <div className="p-4 border-b">
            <div className="flex items-center gap-4">
              <IconButton 
                onClick={() => navigate('/')}
                color="primary"
                edge="start"
              >
                <ArrowBackIcon />
              </IconButton>
              <h1 className="text-xl font-semibold">
                {chatHistory?.title || 'Chat'}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {chatHistory && (
            <div className="space-y-4">
              {chatHistory.messages.map((message) => (
                <div
                  key={`${message.id}-${message.createdAt}`}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <pre className="whitespace-pre-wrap font-sans">
                      {message.content}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
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
            <div className="flex gap-2 self-end">
              <VoiceRecorder 
                onTranscriptionComplete={(text) => setNewMessage(text)}
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export {};  // Add this line to make it a module