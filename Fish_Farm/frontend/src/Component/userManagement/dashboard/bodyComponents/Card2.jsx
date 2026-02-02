import React, { useEffect, useState } from "react";
import ThreeDots from "../../../../assets/userManagement/threeDots.svg";
import PieChartX from "./PieChartX";
import LineChartX from "./LineChartX";
import { ArrowDownToLine } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "../../BaseUrl";

function Card2({ cardName, chartType }) {
    const [farmerPercentage, setFarmerPercentage] = useState(0);
    const [shopPercentage, setShopPercentage] = useState(0);
    const [driverPercentage, setDriverPercentage] = useState(0);

    useEffect(() => {
        const fetchPercentages = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/admin/piechartdata`);
                setFarmerPercentage(response.data.farmerPercentage || 0);
                setShopPercentage(response.data.shopOwnerPercentage || 0);
                setDriverPercentage(response.data.driverPercentage || 0);
            } catch (e) {
                console.log(`Error fetching pie chart data: ${e.message}`);
            }
        };

        fetchPercentages();
    }, []);

    return (
        <div className="card2">
            <div className="card2-header">
                <p className="card2-title">{cardName}</p>
                <img src={ThreeDots} alt="Menu" className="card2-menu" />
            </div>

            <div className="card2-body">
                {chartType === "pie" ? (
                    <div className="card2-pie-container">
                        <div className="card2-pie-charts">
                            <PieChartX percentage={farmerPercentage} name="Admin Accounts" color1="#FF6B6B" color2="#FEECEC" />
                            <PieChartX percentage={shopPercentage} name="Employee Accounts" color1="#17C964" color2="#DFF5E9" />
                            <PieChartX percentage={driverPercentage} name="Customer Accounts" color1="#2D9CDB" color2="#D6EBFA" />
                        </div>
                        <p className="card2-note">Compared with all accounts</p>
                    </div>
                ) : (
                    <div className="card2-line">
                        <LineChartX />
                    </div>
                )}
            </div>

            {chartType === "line" && (
                <div className="card2-button-container">
                    <button className="card2-button">
                        <ArrowDownToLine />
                        Save Report
                    </button>
                </div>
            )}
        </div>
    );
}

export default Card2;

// Pure CSS in same file
const styles = `
.card2 {
    grid-column: span 6;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    position: relative;
}

.card2-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.card2-title {
    font-size: 1rem;
    font-weight: 600;
    color: #2d3748; /* gray-800 */
    margin: 0;
}

.card2-menu {
    cursor: pointer;
    width: 30px;
    height: 30px;
}

.card2-body {
    margin-top: 16px;
}

.card2-pie-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
}

.card2-pie-charts {
    display: flex;
    justify-content: space-around;
    width: 100%;
}

.card2-note {
    margin-top: 24px;
    font-size: 12px;
    color: #555;
}

.card2-line {
    display: flex;
    justify-content: space-around;
}

.card2-button-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
    position: absolute;
    top: 0;
    right: 20px;
}

.card2-button {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #ebf8ff;  /* blue-100 */
    color: #3182ce;       /* blue-600 */
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    border: none;
}
`;

if (typeof document !== "undefined") {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}
