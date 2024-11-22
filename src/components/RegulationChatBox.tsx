import React, { useEffect, useRef, useState } from 'react';
import { useRegulationchatWithGptMutation, useRegulationgetChatHistoryQuery } from '../services/api';
import { Regulation } from '@/types/regulationTypes';
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';
import RegulationBreadcrumb from './RegulationBreadcrumb';
import Layout from './Layout';

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
  const [summaryCreatedTime, setSummaryCreatedTime] = useState<string | null>(null);
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
        // Store summary created time if available
        if (data.gpt_response.timestamp) {
          setSummaryCreatedTime(data.gpt_response.timestamp);
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
    return chatHistory
      .filter((msg) => msg?.content) // Filter out invalid messages
      .map((msg) => ({
        text: msg.content,
        sender: msg.role === 'user' ? 'user' : 'system',
        timestamp: formatTimestamp(msg.timestamp),
      }));
  };

  // Fetch chat history on load
  useEffect(() => {
    refetch();
    if (data?.chat_history && Array.isArray(data.chat_history)) {
      setMessages(mapChatHistory(data.chat_history));

      // Update the summary if it's available and different from the current one
      if (data.gpt_response?.message && data.gpt_response.message !== summary) {
        setSummary(data.gpt_response.message);
      }
      // Update summary created time if available
      if (data.gpt_response.timestamp) {
        setSummaryCreatedTime(data.gpt_response.timestamp);
      }
    }
  }, [data, data?.gpt_response?.message, summary, data?.gpt_response.timestamp, regulation.id]);

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-lg text-red-500">Error loading regulation chat history.</div>
        </div>
      </Layout>
    );
  }

  // Group messages by pairs and reverse the groups
  const groupedMessages = [];
  for (let i = 0; i < messages.length; i += 2) {
    // Ensure both messages exist before pushing
    if (messages[i] && messages[i + 1]) {
      groupedMessages.push([messages[i], messages[i + 1]]);
    } else if (messages[i]) {
      groupedMessages.push([messages[i]]);
    }
  }
  groupedMessages.reverse();


  return (
    <div className="text-left ml-8 mr-8">
  
      {/* Regulation Detail Section */}
      <div className="mb-6 px-4 md:px-6 lg:px-0 w-full">
        <div className='mb-4 md:mb-10 mt-10 pl-3'>
          <h3 className="text-xl md:text-2xl font-bold mb-0 text-center lg:text-left">
            Regulation Details
          </h3>
          <div className="text-center lg:text-left">
          <div className="text-xs sm:text-xs md:text-base">
            <RegulationBreadcrumb regulation={regulation} />
          </div>
          </div>
        </div>
  
        <div className="max-w-2xl lg:max-w-full mx-auto lg:mx-0 lg:pl-3">
          <p className="mb-4 text-center lg:text-left">{regulation.search}</p>
          <p className="text-center lg:text-left">
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
      </div>
  
      {/* Input and Send Message */}
      <div className="flex items-center justify-start space-x-2 mb-10 pl-3">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className="border p-2 w-full sm:w-80 md:w-96 lg:w-1/2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
          placeholder="Type your message to send it to RegAdvisor AI..."
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
        {isGPTTyping && <div className="text-gray-500 italic text-center">RegAdvisor AI is typing...</div>}
          {groupedMessages.map((group, index) => (
            <React.Fragment key={index}>
              {group.map((message, idx) => (
                <div key={idx} className="mb-2 text-left">
                  {message?.text ? (
                    <div className="inline-block p-3 rounded max-w-7xl bg-transparent text-black">
                      <ReactMarkdown>{message.text}</ReactMarkdown>
                      <div className="text-xs text-gray-500 mt-1">{message.timestamp}</div>
                    </div>
                  ) : (
                    <div className="text-red-500">Error: Message content missing</div>
                  )}
                </div>
              ))}
            </React.Fragment>
          ))}

        {summary && (
          <div className="mb-2 p-4 items-center justify-center">
            <strong>Initial Analysis</strong>
            {summaryCreatedTime && (
              <div className="text-xs text-gray-500 mb-7">
                {formatTimestamp(summaryCreatedTime)}
              </div>
            )}
            <ReactMarkdown
              components={{
                
                p: ({node, ...props}) => (
                  <p style={{marginBottom: "2rem"}} {...props} />
                ),
              }}
            >
              {summary}
            </ReactMarkdown>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default RegulationChatBox;
