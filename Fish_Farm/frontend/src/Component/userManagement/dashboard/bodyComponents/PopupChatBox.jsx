import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { IoMdClose } from "react-icons/io";
import Token from "../../logins/Token";

const PopupChatBox = ({ conversationId, userId, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const { role } = Token();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!conversationId) return;

        const fetchMessages = async () => {
            try {
                const res = await axios.get(`http://localhost:8005/api/admin/convo/messages/${conversationId}`, {
                    withCredentials: true
                });
                setMessages(res.data.messages);
            } catch (err) {
                console.error("Error fetching messages:", err);
            }
        };

        fetchMessages();
    }, [conversationId]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const isMarketManager = role === "marketmanager";
        const endpoint = isMarketManager
            ? "http://localhost:8005/api/admin/convo/send"
            : "http://localhost:8005/api/admin/convo/send/user";

        const payload = isMarketManager
            ? { sender: userId, conversationId, message: input }
            : { sender: userId, message: input };

        try {
            const res = await axios.post(endpoint, payload, { withCredentials: true });
            const newMessage = isMarketManager ? res.data.message : res.data.data;
            setMessages((prev) => [...prev, newMessage]);
            setInput("");
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    return (
        <div className="popup-chat-box">
            <div className="chat-header">
                <h2>Chat</h2>
                <button className="close-btn" onClick={onClose}>
                    <IoMdClose size={22} />
                </button>
            </div>

            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message-row ${msg.sender === userId ? "sent" : "received"}`}
                    >
                        <div className="message-bubble">{msg.message}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                />
                <button onClick={handleSend}>Send</button>
            </div>

            <style>{`
                .popup-chat-box {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 380px;
                    height: 380px;
                    background: #fff;
                    border-radius: 16px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    display: flex;
                    flex-direction: column;
                    border: 1px solid #e5e7eb;
                    z-index: 50;
                    font-family: Arial, sans-serif;
                }

                .chat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 16px;
                    background: #f3f4f6;
                    border-bottom: 1px solid #e5e7eb;
                    border-top-left-radius: 16px;
                    border-top-right-radius: 16px;
                }

                .chat-header h2 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #111827;
                }

                .close-btn {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: #6b7280;
                }
                .close-btn:hover {
                    color: #ef4444;
                }

                .chat-messages {
                    flex: 1;
                    padding: 12px 16px;
                    overflow-y: auto;
                    background: #f9fafb;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .message-row {
                    display: flex;
                }

                .message-row.sent {
                    justify-content: flex-end;
                }

                .message-row.received {
                    justify-content: flex-start;
                }

                .message-bubble {
                    max-width: 70%;
                    padding: 8px 12px;
                    border-radius: 12px;
                    word-wrap: break-word;
                }

                .message-row.sent .message-bubble {
                    background-color: #3b82f6;
                    color: #fff;
                    border-bottom-right-radius: 0;
                }

                .message-row.received .message-bubble {
                    background-color: #d1d5db;
                    color: #111827;
                    border-bottom-left-radius: 0;
                }

                .chat-input {
                    display: flex;
                    padding: 10px 16px;
                    border-top: 1px solid #e5e7eb;
                    background: #fff;
                }

                .chat-input input {
                    flex: 1;
                    padding: 8px 12px;
                    border-radius: 9999px;
                    border: 1px solid #d1d5db;
                    font-size: 14px;
                    outline: none;
                }

                .chat-input input:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59,130,246,0.2);
                }

                .chat-input button {
                    margin-left: 8px;
                    background: #3b82f6;
                    color: #fff;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 9999px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .chat-input button:hover {
                    background: #2563eb;
                }
            `}</style>
        </div>
    );
};

export default PopupChatBox;
