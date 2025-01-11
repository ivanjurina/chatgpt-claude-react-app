const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export interface Document {
  id: number;
  userId: number;
  chatId?: number;
  fileName: string;
  storagePath: string;
  extractedText: string;
  uploadedAt: string;
}

export const documentService = {
  async uploadDocument(file: File, chatId?: number): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${API_URL}/api/document/upload${chatId ? `?chatId=${chatId}` : ''}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload document');
    }

    return response.json();
  },

  async getChatDocuments(chatId: number): Promise<Document[]> {
    const response = await fetch(
      `${API_URL}/api/document/chat/${chatId}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch chat documents');
    }

    return response.json();
  },

  async downloadDocument(documentId: number): Promise<void> {
    const response = await fetch(
      `${API_URL}/api/document/${documentId}/download`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download document');
    }

    // Get filename from response headers or use a default
    const contentDisposition = response.headers.get('content-disposition');
    const fileName = contentDisposition
      ? decodeURIComponent(contentDisposition.split('filename=')[1]?.replace(/['"]/g, ''))
      : 'document.pdf';

    // Create blob from response
    const blob = await response.blob();
    
    // Create download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}; 