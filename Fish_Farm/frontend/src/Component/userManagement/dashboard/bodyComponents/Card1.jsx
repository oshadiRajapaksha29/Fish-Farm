import React from "react";

function Card1(props) {
    return (
        <div className="card1">
            <div className="card1-icon">
                <img src={props.icon} alt="icon" />
            </div>
            <div className="card1-content">
                <p className="card1-value">{props.value}</p>
                <p className="card1-name">{props.cardName}</p>
            </div>
        </div>
    );
}

export default Card1;

// Pure CSS inside same file
const styles = `
.card1 {
    grid-column: span 3;
    height: 120px;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background-color: white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.card1-icon {
    margin-right: 4px;
    background-color: #00b07527;
    padding: 8px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.card1-icon img {
    width: 24px;
    height: 24px;
}

.card1-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    margin-left: 4px;
    margin-top: -4px;
}

.card1-value {
    font-size: 30px;
    font-weight: bold;
    color: #464255;
    margin: 0;
}

.card1-name {
    font-size: 12px;
    font-weight: 300;
    color: #464255;
    margin-top: -8px;
}
`;

// Inject styles into the document
if (typeof document !== "undefined") {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}
