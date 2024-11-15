import React, { useEffect, useRef, useState } from 'react';
import { useRegulationchatWithGptMutation, useRegulationgetChatHistoryQuery } from '../services/api';
import { Regulation } from '@/types/regulationTypes';
import dayjs from 'dayjs';

interface Message {
  text: string;
  sender: 'user' | 'system';
  timestamp: string;
}

interface RegulationChatBoxProps {
  regulation: Regulation;
}

const RegulationChatBox: React.FC<RegulationChatBoxProps> = ({ regulation }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [isGPTTyping, setIsGPTTyping] = useState(false);

  const [regulationChatWithGpt, { isLoading: isSendingMessage }] = useRegulationchatWithGptMutation();
  const { data, error, refetch } = useRegulationgetChatHistoryQuery(regulation.id, {
    skip: !regulation.id,
  });
  useEffect(() => {
    refetch();
  }, [regulation.status]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string): string => {
    return dayjs(timestamp).format('DD/MM/YYYY hh:mm A');
  };

  // Scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (input.trim() && regulation.id) {
      const newUserMessage: Message = {
        text: input,
        sender: 'user',
        timestamp: formatTimestamp(new Date().toISOString()),
      };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setInput('');
      setIsGPTTyping(true);

      try {
        const response = await regulationChatWithGpt({ regulationId: regulation.id, message: input }).unwrap();

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

  // Fetch chat history on load
  useEffect(() => {
    refetch();
    if (data?.chat_history) {
      setMessages(mapChatHistory(data.chat_history));

      // Update the summary if it's available and different from the current one
      if (data.gpt_response?.message && data.gpt_response.message !== summary) {
      setSummary(data.gpt_response.message);
    }

      scrollToBottom();
    }
  }, [data, data?.gpt_response?.message, summary, regulation.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (error) {
    return <div>Error loading regulation chat history.</div>;
  }

  return (
    <div className="chat-box border p-4 rounded shadow-md bg-white mx-auto">
      {/* Regulation Detail Section */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">Regulation Details</h3>
        <p><strong>Search:</strong> {regulation.search}</p>
        <p>
          <strong>Status:</strong>{' '}
          <span
            className={`${
              regulation.status === 'STR Allowed'
                ? "bg-green-300 text-green-800"
                : regulation.status === 'STR Not Allowed'
                ? "bg-red-300 text-red-800"
                : regulation.status === 'STR Allowed with Restrictions'
                ? "bg-yellow-300 text-yellow-800"
                : "bg-gray-300 text-gray-800"
            } px-2 py-1 rounded`}
          >
            {regulation.status}
          </span>
        </p>
      </div>

      {/* Chat History Section */}
      <div className="chat-box border p-4 rounded shadow-md bg-white mx-auto">
        {summary && (
          <div className="mb-6 p-4 items-center justify-center  bg-yellow-100 border-l-4 border-yellow-500 rounded">
            <strong>Initial Analysis</strong> 
            <p>{summary}</p>
          </div>
        )}
        <h3 className="text-lg font-bold text-red-600 mb-4">Chat with RegAdvisor AI</h3>
        <div className="chat-messages overflow-y-auto h-72 mb-6 border p-4 rounded bg-gray-50 shadow-inner">
          {messages.map((message, index) => (
            <div key={index} className={`mb-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-3 rounded max-w-4xl ${message.sender === 'user' ? 'bg-red-200 text-red-900' : 'bg-gray-200 text-gray-800'}`}>
                <div>{message.text}</div>
                <div className="text-xs text-gray-500 mt-1">{message.timestamp}</div>
              </div>
            </div>
          ))}
          {isGPTTyping && <div className="text-gray-500 italic">RegAdvisor AI is typing...</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section */}
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            className="border p-3 flex-grow rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
            placeholder="Type your message to send it to RegAdvisor AI..."
          />
          <button
            onClick={handleSendMessage}
            disabled={isSendingMessage || !input.trim()}
            className="ml-2 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegulationChatBox;
