const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const speechService = {
  async streamTranscription(audioBlob: Blob): Promise<ReadableStream> {
    const formData = new FormData();
    formData.append('audioFile', audioBlob, 'recording.wav');

    const response = await fetch(
      `${API_URL}/api/speech/transcribe`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Failed to process speech');
    }

    return response.body!;
  }
}; 