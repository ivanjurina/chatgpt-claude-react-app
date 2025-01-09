# Chat Application

A real-time chat application built with React and TypeScript that allows users to have conversations with an AI assistant.

## Features

- Real-time chat conversations with AI
- Chat history management
- Create new chat sessions
- View and navigate between past conversations
- Clean and responsive UI using Material-UI and Tailwind CSS

## Components

### ChatOverview
- Displays list of all chat conversations
- Allows creating new chats
- Shows chat titles and creation dates
- Navigation to individual chat sessions

### ChatDetail  
- Shows full conversation history for a specific chat
- Real-time message sending and receiving
- Message timestamps and role indicators
- Back navigation to chat overview

## Services

### chatService
Handles all API communication including:
- Fetching chat history
- Getting individual chat details  
- Sending messages
- Creating new chat sessions

## Types

### Message
Represents a single message in a chat conversation:
- id: Unique identifier for the message
- content: The actual message text content
- isUserMessage: Boolean indicating if sent by user or AI
- createdAt: Timestamp of when message was created
- chatId: Optional ID of parent chat
- role: Optional role of message sender (user/assistant)

### ChatHistory
Represents a full chat conversation:
- id: Unique identifier for the chat session
- title: Display title for the chat
- messages: Array of Message objects
- createdAt: Timestamp of when chat was created

## Implementation Details

### Authentication
- JWT token-based authentication
- Token stored in localStorage
- Included in Authorization header for API requests

### API Integration
- Uses axios for HTTP requests
- Configurable API URL via environment variables
- Error handling and loading states

### State Management
- React hooks for local component state
- Real-time updates on message send/receive
- Loading and error states for async operations

### UI/UX Features
- Responsive layout for all screen sizes
- Loading indicators during async operations
- Error messages for failed operations
- Clean message bubbles with timestamps
- Visual distinction between user and AI messages
