import React, { useEffect, useRef, useState } from 'react';
import { useChatWithGptMutation, useGetChatHistoryQuery } from '../services/api';
import dayjs from 'dayjs';
import { Lease } from '@/types/leaseTypes';
import ReactMarkdown from 'react-markdown';
import Layout from './Layout';
import usePollingChatHistory from '@/hooks/leasePollingChatHistory';
import { toggleRefreshDocuments } from '@/store/slices/authSlice';
import { useDispatch} from 'react-redux';

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
  const [summaryCreatedTime, setSummaryCreatedTime] = useState<string | null>(null);
  const [isGPTTyping, setIsGPTTyping] = useState(false);
  const [shouldPoll, setShouldPoll] = useState(true);

  const dispatch = useDispatch();

  const { data, error } = usePollingChatHistory(documentId, shouldPoll);
  const [chatWithGpt, { isLoading: isSendingMessage }] = useChatWithGptMutation();
  const {refetch } = useGetChatHistoryQuery(documentId, { skip: !documentId });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string): string => {
    return dayjs(timestamp).format('DD/MM/YYYY hh:mm A');
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
      setShouldPoll(false);

      try {
        const response = await chatWithGpt({ documentId, message: input }).unwrap();
        refetch(); // Refetch immediately after sending
        setShouldPoll(true); // Resume polling

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

  useEffect(() => {
    // stop polling if doucment is uploaded is more than 20 minutes old, or status is no more pending
    const old_time = new Date(data?.documnet_uploaded_at).getTime();
    const time_difference = (new Date().getTime() - old_time) / 1000;
    const status = data?.gpt_response?.status;
    if (time_difference > 20 || (status && status !== "Pending")) {
      setShouldPoll(false);
      dispatch(toggleRefreshDocuments());
    }
  },
  [shouldPoll, data]);


  // Fetch chat history on load or when data changes
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
  }, [data, documentId, lease]);

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full w-full">
          <div className="text-lg text-red-500">Error loading chat history.</div>
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
        {isGPTTyping && <div className="text-gray-500 italic text-center">LeaseGuard AI is typing...</div>}
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

export default ChatBox;
