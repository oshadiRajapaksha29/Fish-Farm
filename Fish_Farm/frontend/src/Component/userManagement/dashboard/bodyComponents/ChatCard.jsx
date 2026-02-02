import React, { useState, useEffect } from "react";
import PopupChatBox from "./PopupChatBox";
import useToken from "../../logins/Token"; 
import axios from "axios";

function ChatCard(props) {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState(null);
    const { userId } = useToken();

    const handleReply = async () => {
        setJoining(true);
        setError(null);

        try {
            const response = await axios.post(
                "http://localhost:8005/api/admin/convo/join",
                { conversationId: props.conversationId },
                { withCredentials: true }
            );

            console.log("Joined:", response.data.message);
            setIsChatOpen(true);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to join conversation");
            console.error("Join failed:", err);
        } finally {
            setJoining(false);
        }
    };

    return (
        <div className="chat-card">
            <div className="chat-card-header">
                <img src={props.displayPicture} alt="User Avatar" className="chat-card-avatar" />
                <div className="chat-card-info">
                    <h3 className="chat-card-name">{props.name}</h3>
                    <p className="chat-card-time">{props.recievedAt}</p>
                </div>
            </div>

            <p className="chat-card-message">{props.message}</p>

            {error && <p className="chat-card-error">{error}</p>}

            <div className="chat-card-actions">
                <button 
                    className={`chat-card-btn reply-btn ${joining ? "disabled" : ""}`}
                    onClick={handleReply}
                    disabled={joining}
                >
                    {joining ? "Joining..." : "Reply"}
                </button>
                <button className="chat-card-btn ignore-btn">Ignore</button>
            </div>

            {isChatOpen && (
                <PopupChatBox
                    conversationId={props.conversationId}
                    userId={userId}
                    onClose={() => setIsChatOpen(false)}
                />
            )}

            <style>{`
                .chat-card {
                    width: 350px;
                    flex-shrink: 0;
                    background-color: #fff;
                    border-radius: 8px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    padding: 16px;
                    margin-bottom: 8px;
                    display: flex;
                    flex-direction: column;
                }

                .chat-card-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .chat-card-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .chat-card-info {
                    display: flex;
                    flex-direction: column;
                }

                .chat-card-name {
                    color: #464255;
                    font-weight: 600;
                    margin: 0;
                }

                .chat-card-time {
                    font-size: 12px;
                    color: #9ca3af;
                    margin: 0;
                }

                .chat-card-message {
                    margin-top: 12px;
                    font-size: 14px;
                    color: #4b5563;
                    line-height: 1.4;
                    width: 320px;
                    height: 70px;
                    overflow: hidden;
                }

                .chat-card-error {
                    color: #ef4444;
                    font-size: 12px;
                    margin-top: 8px;
                }

                .chat-card-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 16px;
                }

                .chat-card-btn {
                    font-size: 14px;
                    font-weight: 600;
                    padding: 6px 16px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }

                .reply-btn {
                    background-color: #10b981;
                    color: #fff;
                }

                .reply-btn:hover:not(.disabled) {
                    background-color: #059669;
                }

                .ignore-btn {
                    background-color: #ef4444;
                    color: #fff;
                }

                .ignore-btn:hover {
                    background-color: #dc2626;
                }

                .disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}

export default ChatCard;
