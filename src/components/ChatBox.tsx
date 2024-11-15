import React, { useEffect, useRef, useState } from 'react';
import { useChatWithGptMutation, useGetChatHistoryQuery } from '../services/api';
import dayjs from 'dayjs';
import { Lease } from '@/types/leaseTypes';
import ReactMarkdown from 'react-markdown';

interface Message {
  text: string;
  sender: 'user' | 'system';
  timestamp: string;
}

interface ChatBoxProps {
  documentId: string | undefined;
  lease: Lease | null;
}

const ChatBox: React.FC<ChatBoxProps> = ({ documentId, lease }) => {
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
        if (!summary && response.summary) {
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
    refetch();
    if (data?.chat_history) {
      setMessages(mapChatHistory(data.chat_history));

      // Update the summary if it's available and different from the current one
    if (data.gpt_response?.message && data.gpt_response.message !== summary) {
      setSummary(data.gpt_response.message);
    }

      // Scroll to the bottom after messages are updated
      scrollToBottom();
    }
  }, [data, data?.gpt_response?.message, summary, documentId, lease]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (error) {
    return <div>Error loading chat history.</div>;
  }

  return (
    <div className="text-left ml-8 mr-8">

      <div className="flex items-center justify-start space-x-2 mb-10 pl-3">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className="border p-2 w-full sm:w-80 md:w-96 lg:w-1/2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
          placeholder="Type your message to send it to LeaseGuard AI..."
        />
        <button
          onClick={handleSendMessage}
          disabled={isSendingMessage || !input.trim()}
          className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>

      <div className="chat-messages overflow-y-auto mb-6 p-4 pl-0" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {summary && (
          <div className="mb-2 p-4 items-center justify-center">
            <strong>Initial Analysis</strong> 
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        )}
        {messages.map((message, index) => (
          <div key={index} className="mb-2 text-left">
            <div className="inline-block p-3 rounded max-w-7xl bg-transparent text-black">
              <ReactMarkdown>{message.text}</ReactMarkdown>
              <div className="text-xs text-gray-500 mt-1">{message.timestamp}</div>
            </div>
          </div>
        ))}
        {isGPTTyping && <div className="text-gray-500 italic text-center">LeaseGuard AI is typing...</div>}
        <div ref={messagesEndRef} />
      </div>
      
    </div>
  );
};

export default ChatBox;
