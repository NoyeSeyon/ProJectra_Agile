import React, { useState } from 'react';
import { Bot, Send } from 'lucide-react';
import AIAssistant from '../ai/AIAssistant';
import './FloatingChatButtons.css';

const FloatingChatButtons = () => {
  const [showAI, setShowAI] = useState(false);
  const [showSlack, setShowSlack] = useState(false);

  return (
    <>
      {/* AI Assistant */}
      <AIAssistant isOpen={showAI} onClose={() => setShowAI(false)} />

      {/* Slack Chat Modal - Bottom Right */}
      {showSlack && (
        <div className="chat-modal slack-modal">
          <div className="chat-modal-header slack-header">
            <div className="chat-modal-title">
              <Send size={20} />
              <span>Slack Integration</span>
            </div>
            <button 
              className="close-modal-btn"
              onClick={() => setShowSlack(false)}
            >
              ×
            </button>
          </div>
          <div className="chat-modal-body">
            <div className="chat-message bot">
              <p>💬 Connect with your team via Slack!</p>
            </div>
            <div className="chat-message bot">
              <p>Features:</p>
              <ul>
                <li>Send project updates to Slack</li>
                <li>Get notifications in channels</li>
                <li>Create tasks from messages</li>
                <li>Sync team discussions</li>
              </ul>
            </div>
            <div className="integration-status">
              <p className="status-label">Status: <span className="status-disconnected">Not Connected</span></p>
              <button className="connect-btn">Connect to Slack</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatButtons;

