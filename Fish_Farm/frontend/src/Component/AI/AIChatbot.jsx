import React, { useState, useEffect, useRef } from 'react';
import './AIChatbot.css';
import { IoCloseOutline } from 'react-icons/io5';
import { IoIosSend, IoIosChatboxes } from 'react-icons/io';
import { FaRobot, FaLightbulb } from 'react-icons/fa';
import { BiUser } from 'react-icons/bi';
import { AiOutlineReload } from 'react-icons/ai';
import axios from 'axios';

const CHATBOT_API = 'http://localhost:5000/api/chatbot';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! 👋 Welcome to Aqua Peak Fish Farm! I'm your AI assistant powered by artificial intelligence. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
      model: 'System'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [aiProvider, setAiProvider] = useState('auto'); // 'auto', 'openai', 'gemini', 'rulebased'
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Load conversation history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('aquapeak_chat_history');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (parsed.length > 1) {
          setMessages(parsed);
        }
      } catch (e) {
        console.error('Failed to load chat history', e);
      }
    }
    loadSuggestions();
  }, []);

  // Save conversation history to localStorage
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem('aquapeak_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversation suggestions
  const loadSuggestions = async () => {
    try {
      const response = await axios.get(`${CHATBOT_API}/suggestions`);
      if (response.data.success) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error('Failed to load suggestions', error);
    }
  };

  // Send message to AI
  const sendMessageToAI = async (messageText) => {
    try {
      setIsTyping(true);
      setError(null);

      // Prepare conversation history (last 10 messages)
      const conversationHistory = messages
        .slice(-10)
        .map(msg => ({
          role: msg.sender === 'bot' ? 'assistant' : 'user',
          content: msg.text
        }));

      const response = await axios.post(`${CHATBOT_API}/chat`, {
        message: messageText,
        conversationHistory,
        aiProvider
      });

      setIsTyping(false);

      if (response.data.success) {
        const botResponse = {
          id: messages.length + 2,
          text: response.data.reply,
          sender: 'bot',
          timestamp: new Date(),
          model: response.data.model,
          intent: response.data.intent
        };
        setMessages(prevMessages => [...prevMessages, botResponse]);
        setShowSuggestions(false);
      } else {
        throw new Error('Failed to get response');
      }

    } catch (error) {
      setIsTyping(false);
      console.error('AI Chat error:', error);
      
      const errorMessage = {
        id: messages.length + 2,
        text: "I apologize, but I'm having trouble connecting to the AI service right now. 😔 Please try again in a moment, or contact our support team at +94 77 123 4567.",
        sender: 'bot',
        timestamp: new Date(),
        model: 'Error Handler'
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      setError('Connection error. Please try again.');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages([...messages, newUserMessage]);
    
    // Send to AI
    sendMessageToAI(inputValue);
    setInputValue('');
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    // Auto-send the suggestion
    const newUserMessage = {
      id: messages.length + 1,
      text: suggestion,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages([...messages, newUserMessage]);
    sendMessageToAI(suggestion);
    setInputValue('');
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([
        {
          id: 1,
          text: "Chat history cleared! 🔄 How can I help you today?",
          sender: 'bot',
          timestamp: new Date(),
          model: 'System'
        }
      ]);
      localStorage.removeItem('aquapeak_chat_history');
      setShowSuggestions(true);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat toggle button - Small circle */}
      <button 
        className={`ap_ai_toggle_btn ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open AI chat"
      >
        <IoIosChatboxes size={26} />
        <span className="ap_ai_pulse_ring"></span>
      </button>

      {/* Chat window */}
      <div className={`ap_ai_window ${isOpen ? 'open' : ''}`}>
        {/* Chat header */}
        <div className="ap_ai_header">
          <div className="ap_ai_title">
            <div className="ap_ai_avatar">
              <FaRobot />
              <span className="ap_ai_pulse"></span>
            </div>
            <div>
              <h3>Aqua Peak AI Assistant</h3>
              <span className="ap_ai_status">
                <span className="ap_ai_dot"></span>
                Powered by AI • Online
              </span>
            </div>
          </div>
          <div className="ap_ai_actions">
            <button 
              className="ap_ai_action_btn" 
              onClick={handleClearChat}
              title="Clear chat history"
            >
              <AiOutlineReload size={18} />
            </button>
            <button className="ap_ai_close_btn" onClick={() => setIsOpen(false)}>
              <IoCloseOutline size={24} />
            </button>
          </div>
        </div>

        {/* AI Provider indicator */}
        <div className="ap_ai_provider_info">
          <span className="ap_ai_provider_badge">
            🤖 {aiProvider === 'auto' ? 'Smart Mode' : aiProvider.toUpperCase()}
          </span>
        </div>

        {/* Chat messages */}
        <div className="ap_ai_messages">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`ap_ai_message ${message.sender === 'bot' ? 'bot' : 'user'}`}
            >
              <div className="ap_ai_message_avatar">
                {message.sender === 'bot' ? <FaRobot /> : <BiUser />}
              </div>
              <div className="ap_ai_message_content">
                <div className="ap_ai_message_text">
                  {message.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < message.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                <div className="ap_ai_message_meta">
                  <span className="ap_ai_message_time">{formatTime(message.timestamp)}</span>
                  {message.model && (
                    <span className="ap_ai_message_model">• {message.model}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="ap_ai_message bot">
              <div className="ap_ai_message_avatar">
                <FaRobot />
              </div>
              <div className="ap_ai_message_content">
                <div className="ap_ai_typing_indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="ap_ai_message_meta">
                  <span className="ap_ai_typing_text">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="ap_ai_suggestions">
            <div className="ap_ai_suggestions_header">
              <FaLightbulb size={14} />
              <span>Quick questions:</span>
            </div>
            <div className="ap_ai_suggestions_list">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  className="ap_ai_suggestion_btn"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="ap_ai_error">
            ⚠️ {error}
          </div>
        )}

        {/* Chat input */}
        <form className="ap_ai_input" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Ask me anything about Aqua Peak..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isTyping}
          />
          <button type="submit" disabled={!inputValue.trim() || isTyping}>
            <IoIosSend size={24} />
          </button>
        </form>

        {/* Powered by notice */}
        <div className="ap_ai_footer">
          <span>🤖 Powered by Artificial Intelligence</span>
        </div>
      </div>
    </>
  );
};

export default AIChatbot;
