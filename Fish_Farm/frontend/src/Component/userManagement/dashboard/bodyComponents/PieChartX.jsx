import React from "react";
import { PieChart, Pie, Cell } from "recharts";

const PieChartX = ({ percentage, name, color1, color2 }) => {
    if (percentage === undefined || percentage === null || isNaN(percentage)) {
        return <p>Loading...</p>;
    }

    const validPercentage = Math.max(0, Math.min(100, Number(percentage) || 0));
    const data = [
        { name: "Filled", value: validPercentage },
        { name: "Remaining", value: 100 - validPercentage },
    ];

    return (
        <div className="pie-chart-wrapper">
            <div className="pie-chart-inner">
                <PieChart width={100} height={100}>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        fill="#8884d8"
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                    >
                        <Cell key="cell-1" fill={color1} />
                        <Cell key="cell-2" fill={color2} />
                    </Pie>
                </PieChart>
                <div className="percentage-text">{percentage}%</div>
            </div>
            <p className="pie-chart-label">{name}</p>

            <style>{`
                .pie-chart-wrapper {
                    text-align: center;
                    display: inline-block;
                    margin: 0 10px;
                }

                .pie-chart-inner {
                    position: relative;
                    display: inline-block;
                }

                .percentage-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 0.875rem; /* 14px */
                    font-weight: bold;
                    color: #1f2937; /* gray-900 */
                }

                .pie-chart-label {
                    margin-top: 0.5rem;
                    font-size: 0.8125rem; /* 13px */
                    font-weight: 600;
                    color: #374151; /* gray-700 */
                }
            `}</style>
        </div>
    );
};

export default PieChartX;
