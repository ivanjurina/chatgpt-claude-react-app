import { useState, useRef } from 'react';
import { IconButton, CircularProgress } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import { speechService } from '../../services/speechService';

interface VoiceRecorderProps {
  onTranscriptionComplete?: (text: string) => void;
}

export default function VoiceRecorder({ 
  onTranscriptionComplete
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      setIsProcessing(true);
      const reader = new ReadableStreamDefaultReader(
        await speechService.streamTranscription(audioBlob)
      );

      let transcribedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = new TextDecoder().decode(value).split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log('Received transcription data:', data); // Debug log
              
              if (data.isComplete) {
                transcribedText = data.text;
                console.log('Final transcribed text:', transcribedText); // Debug log
                if (onTranscriptionComplete) {
                  onTranscriptionComplete(transcribedText);
                }
              }
            } catch (e) {
              console.error('Error parsing transcription data:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error processing audio:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <IconButton 
      onClick={isRecording ? stopRecording : startRecording}
      color={isRecording ? 'error' : 'primary'}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <CircularProgress size={24} />
      ) : isRecording ? (
        <StopIcon />
      ) : (
        <MicIcon />
      )}
    </IconButton>
  );
} 