import React, { useState } from "react";
import ThreeDots from "../../../../assets/userManagement/threeDots.svg";
import { BASE_URL } from "../../BaseUrl";

function Card4() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const sendBroadcast = async () => {
        if (!title.trim() || !message.trim()) {
            alert("Title and message cannot be empty.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/api/admin/broadcast/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, message }),
            });

            if (!response.ok) throw new Error("Failed to send broadcast");

            alert("Broadcast sent successfully!");
            setTitle("");
            setMessage("");
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card4">
            <div className="card4-header">
                <h2 className="card4-title">Broadcast</h2>
                <img className="card4-options" src={ThreeDots} alt="Options" />
            </div>

            <div className="card4-body">
                <input
                    type="text"
                    placeholder="Type Heading ..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="card4-input"
                />
                <textarea
                    rows="4"
                    placeholder="Message ..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="card4-textarea"
                />
            </div>

            <div className="card4-footer">
                <button
                    type="button"
                    onClick={sendBroadcast}
                    disabled={loading}
                    className={`card4-button ${loading ? "loading" : ""}`}
                >
                    {loading ? "SENDING..." : "SEND"}
                </button>
            </div>
        </div>
    );
}

export default Card4;

// Pure CSS for Card4
const styles = `
.card4 {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    grid-column: span 4;
    padding: 24px;
    display: flex;
    flex-direction: column;
}

.card4-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card4-title {
    font-size: 1.25rem; /* text-xl */
    font-weight: 600;
    color: #464255;
}

.card4-options {
    width: 30px;
    height: 30px;
    cursor: pointer;
}

.card4-body {
    display: flex;
    flex-direction: column;
    margin-top: 16px;
    gap: 16px;
}

.card4-input, .card4-textarea {
    width: 100%;
    padding: 12px;
    border-radius: 6px;
    background: #EBF8FF;
    border: 1px solid #d1d5db;
    font-size: 0.875rem; /* text-sm */
    color: #374151; /* gray-700 */
    outline: none;
    resize: none;
}

.card4-input::placeholder, .card4-textarea::placeholder {
    color: #9ca3af; /* placeholder-gray-500 */
}

.card4-input:focus, .card4-textarea:focus {
    border-color: #3B82F6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.card4-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
}

.card4-button {
    background: #3B82F6;
    color: white;
    font-weight: 600;
    text-transform: uppercase;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    border: none;
    transition: background 0.2s ease;
}

.card4-button:hover:not(.loading) {
    background: #2563EB;
}

.card4-button.loading {
    opacity: 0.5;
    cursor: not-allowed;
}

.card4-button:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}
`;

// Inject CSS into document
if (typeof document !== "undefined") {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}
