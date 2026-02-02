import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import ChatCard from "./ChatCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Card5() {
    const scrollContainerRef = useRef(null);
    const [adminConversations, setAdminConversations] = useState([]);
    const [freeConversations, setFreeConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
        }
    };

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const [adminRes, freeRes] = await Promise.all([
                    axios.get("http://localhost:8005/api/admin/convo/admin", { withCredentials: true }),
                    axios.get("http://localhost:8005/api/admin/convo", { withCredentials: true }),
                ]);
                setAdminConversations(adminRes.data || []);
                setFreeConversations(freeRes.data || []);
            } catch (error) {
                console.error("Error fetching conversations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, []);

    const renderChats = (chats) =>
        chats.map((chat, index) => (
            <ChatCard
                key={index}
                name={chat.userName}
                recievedAt={new Date(chat.lastMessageTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                })}
                message={chat.lastMessage}
                displayPicture={chat.userDisplayPicture}
                conversationId={chat.conversationId}
            />
        ));

    return (
        <div className="card5">
            <div className="card5-header">
                <div>
                    <h2 className="card5-title">User Support Requests</h2>
                    <p className="card5-subtitle">Helping users through live chat</p>
                </div>
                <div className="card5-controls">
                    <button className="card5-btn" onClick={scrollLeft}>
                        <ChevronLeft className="icon" />
                    </button>
                    <button className="card5-btn" onClick={scrollRight}>
                        <ChevronRight className="icon" />
                    </button>
                </div>
            </div>

            <div ref={scrollContainerRef} className="card5-body">
                {loading ? (
                    <p className="text-gray">Loading chats...</p>
                ) : adminConversations.length === 0 && freeConversations.length === 0 ? (
                    <p className="text-gray">No chats found.</p>
                ) : (
                    <>
                        {renderChats(adminConversations)}
                        {renderChats(freeConversations)}
                    </>
                )}
            </div>
        </div>
    );
}

export default Card5;

// Pure CSS for Card5
const styles = `
.card5 {
    padding: 24px;
    grid-column: span 12;
    display: flex;
    flex-direction: column;
}

.card5-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card5-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #464255;
}

.card5-subtitle {
    font-size: 0.875rem;
    color: #9ca3af;
}

.card5-controls {
    display: flex;
    gap: 8px;
}

.card5-btn {
    padding: 8px;
    background: #f3f4f6;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
}

.card5-btn:hover {
    background: #e5e7eb;
}

.icon {
    width: 16px;
    height: 16px;
    color: #6b7280;
}

.card5-body {
    display: flex;
    gap: 16px;
    margin-top: 24px;
    overflow-x: auto;
    scroll-behavior: smooth;
    padding-bottom: 8px;
}

.card5-body::-webkit-scrollbar {
    height: 8px;
}

.card5-body::-webkit-scrollbar-thumb {
    background-color: rgba(8, 149, 102, 0.3);
    border-radius: 4px;
}

.card5-body::-webkit-scrollbar-track {
    background-color: #f3f2f7;
}
`;

// Inject CSS into document
if (typeof document !== "undefined") {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}
