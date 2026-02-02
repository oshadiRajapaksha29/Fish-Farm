import React, { useState, useEffect, useRef } from 'react';
import './LiveChat.css';
import { IoCloseOutline } from 'react-icons/io5';
import { IoIosSend, IoIosChatboxes } from 'react-icons/io';
import { FaRobot } from 'react-icons/fa';
import { BiUser } from 'react-icons/bi';

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! 👋 Welcome to Aqua Peak! How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto responses for demo purposes
  const autoResponses = [
    "Thank you for your message! Our team will get back to you shortly.",
    "I understand you have a question about our products. Could you please provide more details?",
    "Our business hours are 9 AM to 5 PM, Monday through Friday.",
    "I'd be happy to help you place an order. What specific products are you interested in?",
    "For fish health concerns, I recommend checking out our Fish Health Guide in the Resources section.",
  ];

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    setInputValue('');

    // Simulate bot typing
    setIsTyping(true);
    
    // Simulate bot response after a delay
    setTimeout(() => {
      setIsTyping(false);
      const botResponse = {
        id: messages.length + 2,
        text: autoResponses[Math.floor(Math.random() * autoResponses.length)],
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prevMessages => [...prevMessages, botResponse]);
    }, 1500);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat toggle button */}
      <button 
        className={`r_l_c_toggle_btn ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        aria-label="Open chat"
      >
        <IoIosChatboxes size={28} />
        <span className="r_l_c_toggle_text">Chat with us</span>
      </button>

      {/* Chat window */}
      <div className={`r_l_c_window ${isOpen ? 'open' : ''}`}>
        {/* Chat header */}
        <div className="r_l_c_header">
          <div className="r_l_c_title">
            <div className="r_l_c_avatar">
              <FaRobot />
            </div>
            <div>
              <h3>Aqua Peak Bot</h3>
              <span className="r_l_c_status">Online</span>
            </div>
          </div>
          <button className="r_l_c_close_btn" onClick={() => setIsOpen(false)}>
            <IoCloseOutline size={24} />
          </button>
        </div>

        {/* Chat promo banner */}
        <div className="r_l_c_promo">
          <h2>
            Say <span className="highlight">"Hello"</span>
          </h2>
          <p>& Get <span className="highlight">Discount</span> on your next order!</p>
        </div>

        {/* Chat messages */}
        <div className="r_l_c_messages">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`r_l_c_message ${message.sender === 'bot' ? 'bot' : 'user'}`}
            >
              <div className="r_l_c_message_avatar">
                {message.sender === 'bot' ? <FaRobot /> : <BiUser />}
              </div>
              <div className="r_l_c_message_content">
                <div className="r_l_c_message_text">{message.text}</div>
                <div className="r_l_c_message_time">{formatTime(message.timestamp)}</div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="r_l_c_message bot">
              <div className="r_l_c_message_avatar">
                <FaRobot />
              </div>
              <div className="r_l_c_message_content">
                <div className="r_l_c_typing_indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat input */}
        <form className="r_l_c_input" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
          />
          <button type="submit" disabled={!inputValue.trim()}>
            <IoIosSend size={20} />
          </button>
        </form>

        {/* Chat footer */}
        <div className="r_l_c_footer">
          <span>Powered by Aqua Peak</span>
        </div>
      </div>
    </>
  );
};

export default LiveChat;