import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { BASE_URL } from "../../BaseUrl";

function LineChartX() {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/admin/sysload`);

                const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                const fullWeekData = weekDays.map(day => ({ name: day, requests: 0 }));

                const backendData = response.data.map(entry => ({
                    name: new Date(entry.date).toLocaleDateString("en-US", { weekday: "long" }),
                    requests: entry.requestCount,
                }));

                const mergedData = fullWeekData.map(day => {
                    const existingData = backendData.find(d => d.name === day.name);
                    return existingData ? existingData : day;
                });

                setChartData(mergedData);
            } catch (error) {
                console.error("Error fetching system load:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="line-chart-container">
            <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ left: 25, right: 25, top: 5 }}>
                    <XAxis dataKey="name" className="line-chart-xaxis" interval={0} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", backgroundColor: "#ffffff", border: "1px solid #e5e7eb", padding: "6px" }} />
                    <Line
                        type="monotone"
                        dataKey="requests"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        dot={{ fill: "#3B82F6", r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>

            <style>{`
                .line-chart-container {
                    width: 100%;
                    height: 180px;
                    background-color: #ffffff;
                    border-radius: 12px;
                    padding: 10px 0;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                }

                .line-chart-xaxis text {
                    fill: #9CA3AF;
                    font-size: 10px;
                }
            `}</style>
        </div>
    );
}

export default LineChartX;
