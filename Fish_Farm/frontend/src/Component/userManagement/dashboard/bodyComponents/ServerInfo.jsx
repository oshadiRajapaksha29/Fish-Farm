import React from "react";
import { motion } from "framer-motion";
import ServerInfoProvider from "./ServerInfoProvider";
import { Server, Cpu, MemoryStick, HardDrive, Network, Database, Thermometer, BatteryCharging, Activity, Globe, Layers, HardDriveDownload } from "lucide-react";

const ServerInfo = () => {
    return (
        <ServerInfoProvider>
            {(serverData) => {
                const formattedData = {
                    os: serverData.osType || "Unknown OS",
                    processor: serverData.processor || "Unknown Processor",
                    ram: `${serverData.ramUsage || 0}% Used`,
                    disk: `${serverData.diskUsage || 0}% Used`,
                    ip: { public: "192.168.1.1", private: "10.0.0.1" },
                    database: "MongoDB",
                    temperature: `${serverData.swapMemory || "N/A"} C`,
                    powerStatus: serverData.powerStatus || "Unknown Power Status",
                    hostname: "localhost",
                    cpuLoad: `${serverData.cpuUsage || 0}%`,
                    totalProcesses: serverData.totalProcessos || "N/A",
                    swapMemory: `${serverData.swapMemory || "N/A"} GB Used`,
                };

                const cardVariants = {
                    hidden: { opacity: 0, y: 20 },
                    visible: (i) => ({
                        opacity: 1,
                        y: 0,
                        transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" },
                    }),
                };

                return (
                    <motion.div initial="hidden" animate="visible" className="container">
                        <h2 className="title">Server Information</h2>
                        <div className="grid">
                            {[
                                { icon: <Server className="icon blue" />, label: "Operating System", value: formattedData.os },
                                { icon: <Cpu className="icon yellow" />, label: "Processor", value: formattedData.processor },
                                { icon: <MemoryStick className="icon green" />, label: "RAM Usage", value: formattedData.ram },
                                { icon: <HardDrive className="icon purple" />, label: "Disk Space", value: formattedData.disk },
                                { icon: <Network className="icon orange" />, label: "IP Address", value: `Public: ${formattedData.ip.public}, Private: ${formattedData.ip.private}` },
                                { icon: <Database className="icon red" />, label: "Database Server", value: formattedData.database },
                                { icon: <Thermometer className="icon pink" />, label: "System Temperature", value: formattedData.temperature },
                                { icon: <BatteryCharging className="icon teal" />, label: "Power Status", value: formattedData.powerStatus },
                                { icon: <Globe className="icon indigo" />, label: "Hostname", value: formattedData.hostname },
                                { icon: <Activity className="icon yellow-dark" />, label: "CPU Load", value: formattedData.cpuLoad },
                                { icon: <Layers className="icon cyan" />, label: "Total Processes", value: formattedData.totalProcesses },
                                { icon: <HardDriveDownload className="icon purple-dark" />, label: "Swap Memory", value: formattedData.swapMemory },
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    variants={cardVariants}
                                    custom={index}
                                    whileHover={{ scale: 1.05 }}
                                    className="card"
                                >
                                    {item.icon}
                                    <div>
                                        <p className="label">{item.label}</p>
                                        <p className="value">{item.value}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <style>{`
                            .container {
                                max-width: 960px;
                                margin: 0 auto;
                                padding: 32px;
                                color: #f8fafc;
                            }
                            .title {
                                text-align: center;
                                font-size: 2rem;
                                font-weight: bold;
                                margin-bottom: 24px;
                                color: #f8fafc;
                            }
                            .grid {
                                display: grid;
                                grid-template-columns: repeat(1, 1fr);
                                gap: 16px;
                            }
                            @media(min-width: 768px) {
                                .grid {
                                    grid-template-columns: repeat(2, 1fr);
                                }
                            }
                            .card {
                                display: flex;
                                align-items: center;
                                gap: 16px;
                                padding: 16px;
                                background-color: #1e293b;
                                border-radius: 12px;
                                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                                transition: transform 0.2s, box-shadow 0.2s;
                            }
                            .card:hover {
                                box-shadow: 0 8px 20px rgba(0,0,0,0.2);
                            }
                            .icon {
                                width: 28px;
                                height: 28px;
                                flex-shrink: 0;
                            }
                            .blue { color: #60a5fa; }
                            .yellow { color: #facc15; }
                            .green { color: #4ade80; }
                            .purple { color: #a78bfa; }
                            .orange { color: #fb923c; }
                            .red { color: #f87171; }
                            .pink { color: #f472b6; }
                            .teal { color: #2dd4bf; }
                            .indigo { color: #818cf8; }
                            .yellow-dark { color: #eab308; }
                            .cyan { color: #22d3ee; }
                            .purple-dark { color: #8b5cf6; }

                            .label {
                                font-size: 0.875rem;
                                color: #cbd5e1;
                                margin: 0;
                            }
                            .value {
                                font-size: 1rem;
                                font-weight: 600;
                                color: #f8fafc;
                                margin: 0;
                            }
                        `}</style>
                    </motion.div>
                );
            }}
        </ServerInfoProvider>
    );
};

export default ServerInfo;
