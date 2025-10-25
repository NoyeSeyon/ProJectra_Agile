import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Maximize2, Minimize2, Send, Sparkles, Zap } from 'lucide-react';
import aiAssistant from '../../services/aiAssistantService';
import './AIAssistant.css';

const AIAssistant = ({ isOpen: externalIsOpen, onClose: externalOnClose }) => {
  const [isOpen, setIsOpen] = useState(externalIsOpen || false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm Projectra AI, your intelligent assistant. I can help you create tasks, analyze projects, check team status, and provide smart suggestions. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickSuggestions, setQuickSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setIsOpen(externalIsOpen);
    }
  }, [externalIsOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load quick suggestions
    setQuickSuggestions(aiAssistant.getQuickSuggestions());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (externalOnClose && !newState) {
      externalOnClose();
    }
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    // Show typing indicator
    setIsTyping(true);

    // Simulate thinking delay
    setTimeout(async () => {
      try {
        // Process message with AI
        const response = await aiAssistant.processMessage(userMessage);

        // Add assistant response
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.response,
          timestamp: new Date(),
          quickActions: response.quickActions,
          data: response.data
        }]);
      } catch (error) {
        console.error('AI Assistant error:', error);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I apologize, but I encountered an error. Please try again.",
          timestamp: new Date(),
          error: true
        }]);
      } finally {
        setIsTyping(false);
      }
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleQuickAction = async (action) => {
    const actionMessages = {
      createTask: "Create a new task",
      analytics: "Show me project analytics",
      teamStatus: "What's my team status?",
      suggestions: "Give me some suggestions",
      help: "Help"
    };

    const message = actionMessages[action] || action;
    setInputValue(message);
    setTimeout(() => handleSend(), 100);
  };

  const formatMessage = (content) => {
    // Convert markdown-like formatting to HTML
    return content
      .split('\n').map((line, i) => {
        // Bold text
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Bullet points
        if (line.trim().startsWith('•')) {
          return `<div key=${i} class="message-bullet">${line}</div>`;
        }
        return `<div key=${i}>${line || '<br/>'}</div>`;
      }).join('');
  };

  if (!isOpen) {
    return (
      <button
        className="ai-assistant-fab"
        onClick={handleToggle}
        title="Open AI Assistant"
      >
        <Sparkles size={24} />
        <span className="ai-pulse"></span>
      </button>
    );
  }

  return (
    <div className={`ai-assistant-container ${isExpanded ? 'expanded' : ''}`}>
      {/* Header */}
      <div className="ai-assistant-header">
        <div className="ai-assistant-title">
          <Sparkles size={20} className="ai-icon" />
          <span>Projectra AI</span>
          <span className="ai-status-dot"></span>
        </div>
        <div className="ai-assistant-actions">
          <button
            className="ai-header-btn"
            onClick={handleExpand}
            title={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button
            className="ai-header-btn"
            onClick={handleToggle}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="ai-assistant-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`ai-message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            {message.role === 'assistant' && (
              <div className="message-avatar">
                <Sparkles size={16} />
              </div>
            )}
            <div className="message-content">
              <div
                className="message-text"
                dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
              />
              {message.quickActions && message.quickActions.length > 0 && (
                <div className="quick-actions">
                  {message.quickActions.map((action, i) => (
                    <button
                      key={i}
                      className="quick-action-btn"
                      onClick={() => handleQuickAction(action.action)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {message.role === 'user' && (
              <div className="message-avatar user-avatar">
                <span>You</span>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="ai-message assistant-message">
            <div className="message-avatar">
              <Sparkles size={16} />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {quickSuggestions.length > 0 && (
        <div className="ai-quick-suggestions">
          <div className="suggestions-label">
            <Zap size={14} />
            <span>Quick suggestions:</span>
          </div>
          <div className="suggestions-list">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-chip"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="ai-assistant-input">
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything..."
          rows="1"
          className="ai-input-field"
        />
        <button
          className="ai-send-btn"
          onClick={handleSend}
          disabled={!inputValue.trim()}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
