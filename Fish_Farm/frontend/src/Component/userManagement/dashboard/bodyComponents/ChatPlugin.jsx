import React, { useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import PopupChatBox from './PopupChatBox'; // Ensure correct import path
import Token from '../../logins/Token';

function ChatPlugin({ conversationId }) {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const userId = Token().userId;

    return (
        <div>
            <div
                className="chat-plugin-btn"
                onClick={() => setIsChatOpen(true)}
            >
                <ChatBubbleLeftRightIcon className="chat-plugin-icon" />
            </div>

            {isChatOpen && (
                <PopupChatBox
                    onClose={() => setIsChatOpen(false)}
                    conversationId={null}
                    userId={userId}
                />
            )}

            <style>{`
                .chat-plugin-btn {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    background-color: #16a34a;
                    padding: 12px;
                    border-radius: 9999px;
                    cursor: pointer;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
                    z-index: 50;
                    transition: background-color 0.2s ease;
                }

                .chat-plugin-btn:hover {
                    background-color: #15803d;
                }

                .chat-plugin-icon {
                    width: 24px;
                    height: 24px;
                    color: #ffffff;
                }
            `}</style>
        </div>
    );
}

export default ChatPlugin;
