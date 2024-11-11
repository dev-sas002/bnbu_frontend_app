import React, { useEffect, useRef, useState } from 'react';
import { useChatWithGptMutation, useGetChatHistoryQuery } from '../services/api';
import dayjs from 'dayjs';

interface Message {
  text: string;
  sender: 'user' | 'system';
  timestamp: string;
}

interface ChatBoxProps {
  documentId: string | undefined;
}

const ChatBox: React.FC<ChatBoxProps> = ({ documentId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [isGPTTyping, setIsGPTTyping] = useState(false);
  
  const [chatWithGpt, { isLoading: isSendingMessage }] = useChatWithGptMutation();
  const { data, error, refetch } = useGetChatHistoryQuery(documentId, {
    skip: !documentId,
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string): string => {
    return dayjs(timestamp).format('DD/MM/YYYY hh:mm A');
  };

  // Function to scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Function to handle sending a new message
  const handleSendMessage = async () => {
    if (input.trim() && documentId) {
      const newUserMessage: Message = {
        text: input,
        sender: 'user',
        timestamp: formatTimestamp(new Date().toISOString()),
      };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setInput('');
      setIsGPTTyping(true);

      try {
        const response = await chatWithGpt({ documentId, message: input }).unwrap();

        // Refresh chat history after sending a message
        refetch();

        const systemResponse: Message = {
          text: response.response,
          sender: 'system',
          timestamp: formatTimestamp(response.chat_history.slice(-1)[0]?.timestamp || new Date().toISOString()),
        };
        setMessages((prevMessages) => [...prevMessages, systemResponse]);

        // Update summary if available
        if (summary === null && response.summary) {
          setSummary(response.summary);
        }
      } catch (err) {
        console.error('Error chatting with GPT:', err);
      } finally {
        setIsGPTTyping(false);
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  // Map chat history from backend response
  const mapChatHistory = (chatHistory: any[]): Message[] => {
    return chatHistory.map((msg) => ({
      text: msg.content,
      sender: msg.role === 'user' ? 'user' : 'system',
      timestamp: formatTimestamp(msg.timestamp),
    }));
  };

  // Fetch chat history on load or when data changes
  useEffect(() => {
    if (data?.chat_history) {
      setMessages(mapChatHistory(data.chat_history));
      setSummary(data.gpt_response?.message || null);
      scrollToBottom();
    }
  }, [data]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (error) {
    return <div>Error loading chat history.</div>;
  }

  return (
    <div className="chat-box border p-4 rounded shadow-md bg-white">
      <h3 className="text-lg font-semibold mb-2">Chat</h3>
      {summary && (
        <div className="mb-4 p-3 bg-yellow-100 border rounded">
          <strong>Summary:</strong> {summary}
        </div>
      )}
      <div className="chat-messages overflow-y-auto h-64 mb-3 border p-2 rounded bg-gray-100">
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded ${message.sender === 'user' ? 'bg-blue-200' : 'bg-gray-200'}`}>
              <div>{message.text}</div>
              <div className="text-xs text-gray-500 mt-1">{message.timestamp}</div>
            </div>
          </div>
        ))}
        {isGPTTyping && <div className="text-gray-500">typing...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className="border p-2 flex-grow rounded"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSendMessage}
          disabled={isSendingMessage || !input.trim()}
          className="ml-2 p-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
