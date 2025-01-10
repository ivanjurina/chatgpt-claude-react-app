import { TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import VoiceRecorder from '../common/VoiceRecorder';

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSend: () => void;
}

export default function ChatInput({ 
  message, 
  setMessage, 
  onSend 
}: ChatInputProps) {
  return (
    <div className="flex items-center gap-2 p-4">
      <VoiceRecorder 
        onTranscriptionComplete={setMessage}
      />
      <TextField
        fullWidth
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        onKeyPress={(e) => e.key === 'Enter' && onSend()}
      />
      <IconButton onClick={onSend} color="primary">
        <SendIcon />
      </IconButton>
    </div>
  );
} 