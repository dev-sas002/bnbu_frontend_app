import React, { useState } from 'react';

interface Message {
  text: string;
  sender: 'user' | 'system';
  timestamp: string;
}

interface ChatBoxProps {
  documentId: string | undefined; // Allow undefined since useParams can return undefined
}

const ChatBox: React.FC<ChatBoxProps> = ({ documentId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const getFormattedTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = () => {
    if (input.trim()) {
      const timestamp = getFormattedTimestamp();

      // Add the user message to the chat
      setMessages([...messages, { text: input, sender: 'user', timestamp }]);
      setInput('');

      // Add a sample system reply (you can customize this logic)
      setMessages(prevMessages => [
        ...prevMessages,
        { text: input, sender: 'user', timestamp },
        { text: 'System message reply here.', sender: 'system', timestamp: getFormattedTimestamp() },
      ]);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  return (
    <div className="chat-box border p-4 rounded shadow-md bg-white">
      <h3 className="text-lg font-semibold mb-2">Chat</h3>
      <div className="chat-messages overflow-y-auto h-48 mb-3 border p-2 rounded bg-gray-100">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-2 my-1 rounded ${
              message.sender === 'user' ? 'bg-red-500 text-white text-right' : 'bg-gray-300 text-black'
            }`}
          >
            <div>{message.text}</div>
            <div className="text-xs mt-1 text-gray-500">
              {message.timestamp}
            </div>
          </div>
        ))}
      </div>
      <div className="chat-input flex">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-l"
        />
        <button
          onClick={handleSendMessage}
          className="bg-red-500 text-white p-2 rounded-r hover:bg-red-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
