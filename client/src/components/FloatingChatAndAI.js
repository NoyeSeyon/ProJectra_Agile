import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, MessageSquare, X, Minimize2 } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import AIAssistant from './ai/AIAssistant';
import axios from 'axios';

const FloatingChatAndAI = () => {
  const [openTab, setOpenTab] = useState(null); // 'chat' | 'ai' | null
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { socket, connected, emitChatMessage, onChatMessage } = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (socket && onChatMessage) {
      const unsubscribe = onChatMessage((message) => {
        setChatMessages(prev => [...prev, message]);
      });
      return unsubscribe;
    }
  }, [socket, onChatMessage]);

  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return;

    const messageData = {
      text: chatMessage,
      sender: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      },
      timestamp: new Date(),
      orgId: user.organization,
      channelId: 'general'
    };

    setChatMessages(prev => [...prev, messageData]);
    emitChatMessage(messageData);
    setChatMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  const closePanel = () => {
    setOpenTab(null);
    setIsMinimized(false);
  };

  const minimizePanel = () => {
    setIsMinimized(!isMinimized);
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <style jsx>{`
        .floating-chat {
          position: relative;
        }
        
        .chat-panel {
          position: absolute;
          bottom: 60px;
          right: 0;
          width: 400px;
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          border: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .chat-header {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          max-height: 350px;
        }
        
        .chat-input {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 8px;
          align-items: center;
        }
        
        .chat-bubble {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #3b82f6;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .chat-bubble:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-bounce-in {
          animation: bounceIn 0.3s ease-out;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounceIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      {/* Chat/AI Panels */}
      {openTab && !isMinimized && (
        <div className="chat-panel animate-slide-up">
          {/* Header */}
          <div className="chat-header">
            <div className="flex items-center gap-2">
              {openTab === 'chat' ? <MessageSquare size={16} /> : <Bot size={16} />}
              <span className="font-medium">
                {openTab === 'chat' ? 'Team Chat' : 'Projectra AI'}
              </span>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={minimizePanel}
                className="p-1 hover:bg-gray-100 rounded"
                title="Minimize"
              >
                <Minimize2 size={14} />
              </button>
              <button
                onClick={closePanel}
                className="p-1 hover:bg-gray-100 rounded"
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="chat-messages scrollbar-hide">
            {openTab === 'chat' ? (
              <>
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-4">
                    <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
                    <p>Start a conversation with your team...</p>
                    {!connected && (
                      <p className="text-red-500 text-xs mt-1">Connecting to chat...</p>
                    )}
                  </div>
                ) : (
                  chatMessages.map((message, index) => (
                    <div key={index} className="flex gap-2 mb-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {message.sender?.firstName?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">
                          {message.sender?.firstName} {message.sender?.lastName}
                        </div>
                        <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                          {message.text}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </>
            ) : (
              <div className="h-full">
                <AIAssistant />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area (only for chat, AI Assistant has its own input) */}
          {openTab === 'chat' && (
            <div className="chat-input">
              <input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e)}
                placeholder="Type a message..."
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={sendChatMessage}
                disabled={!chatMessage.trim()}
                className="rounded-xl px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Minimized Panel */}
      {openTab && isMinimized && (
        <div className="bg-white rounded-lg shadow-lg border p-3 animate-bounce-in">
          <div className="flex items-center gap-2">
            {openTab === 'chat' ? <MessageSquare size={16} /> : <Bot size={16} />}
            <span className="text-sm font-medium">
              {openTab === 'chat' ? 'Team Chat' : 'AI Assistant'}
            </span>
            <button
              onClick={minimizePanel}
              className="ml-auto p-1 hover:bg-gray-100 rounded"
            >
              <Minimize2 size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setOpenTab(openTab === 'chat' ? null : 'chat')}
          className={`chat-bubble ${openTab === 'chat' ? 'bg-blue-600 text-white' : ''}`}
          title="Open Team Chat"
        >
          <MessageSquare size={20} />
        </button>
        <button
          onClick={() => setOpenTab(openTab === 'ai' ? null : 'ai')}
          className={`chat-bubble ${openTab === 'ai' ? 'bg-blue-600 text-white' : ''}`}
          title="Open AI Assistant"
        >
          <Bot size={20} />
        </button>
      </div>
    </div>
  );
};

export default FloatingChatAndAI;