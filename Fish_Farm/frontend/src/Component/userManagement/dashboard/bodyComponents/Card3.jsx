import React, { useEffect, useState } from "react";
import axios from "axios";
import CriticalAlert from "./CriticalAlert";
import { BASE_URL } from "../../BaseUrl";

function Card3() {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const fetchCriticalAlerts = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/admin/critical-alerts`);
                setAlerts(response.data.alerts);
            } catch (error) {
                console.error("Error fetching critical alerts:", error);
            }
        };
        fetchCriticalAlerts();
    }, []);

    return (
        <div className="card3">
            <div className="card3-header">
                <p className="card3-title">Critical Alerts</p>
            </div>

            <div className="card3-body">
                <div className="spacer-top"></div>
                {alerts.length > 0 ? (
                    alerts.map((alert) => (
                        <CriticalAlert key={alert._id} alertData={alert} />
                    ))
                ) : (
                    <p className="no-alerts">No critical alerts</p>
                )}
                <div className="spacer-bottom"></div>
            </div>
        </div>
    );
}

export default Card3;

// Pure CSS for Card3
const styles = `
.card3 {
    background: white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    grid-column: span 8;
    height: 320px;
    border-radius: 8px;
    padding: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.card3-header {
    width: 100%;
    padding-bottom: 8px;
}

.card3-title {
    color: #464255;
    margin-left: 8px;
    margin-top: 12px;
    font-size: 1.125rem; /* text-lg */
    font-weight: 600;
}

.card3-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 0 8px;
    overflow-y: auto;
}

.spacer-top {
    height: 16px;
}

.spacer-bottom {
    height: 16px;
    margin-bottom: 16px;
}

.no-alerts {
    color: #6b7280; /* gray-500 */
    text-align: center;
}

/* Optional: simple scrollbar styling */
.card3-body::-webkit-scrollbar {
    width: 6px;
}

.card3-body::-webkit-scrollbar-thumb {
    background-color: rgba(8, 149, 102, 0.36);
    border-radius: 3px;
}

.card3-body::-webkit-scrollbar-track {
    background-color: #ffffff;
}
`;

// Inject CSS into document
if (typeof document !== "undefined") {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}
