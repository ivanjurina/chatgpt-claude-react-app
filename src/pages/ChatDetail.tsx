import ChatHistory from '../components/ChatHistory';

const ChatDetail = () => {
  // Assuming you get the chatId from route params or props
  const chatId = '...'; 

  return (
    <div className="container mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Chat History</h1>
      <ChatHistory chatId={chatId} />
    </div>
  );
};

export default ChatDetail; 