import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";

function CriticalAlert({ alertData }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="critical-alert">
                <div className="critical-alert-left">
                    <AlertCircle size={18} className="critical-alert-icon" />
                    <p className="critical-alert-title">{alertData.title}</p>
                </div>
                <button className="critical-alert-btn" onClick={() => setIsOpen(true)}>
                    More Details
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="critical-alert-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="critical-alert-modal"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            <button className="critical-alert-close" onClick={() => setIsOpen(false)}>
                                <X size={16} />
                            </button>

                            <h2 className="critical-alert-modal-title">{alertData.title}</h2>
                            <p><strong>Type:</strong> {alertData.type}</p>
                            <p><strong>Date:</strong> {new Date(alertData.date).toLocaleString()}</p>
                            <p><strong>Message:</strong> {alertData.message}</p>

                            <button className="critical-alert-modal-btn" onClick={() => setIsOpen(false)}>
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .critical-alert {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color: rgba(0, 176, 117, 0.24);
                    padding: 8px;
                    border-radius: 8px;
                    margin-bottom: 8px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    transition: background-color 0.2s ease;
                    cursor: default;
                }

                .critical-alert:hover {
                    background-color: rgba(0, 176, 117, 0.35);
                }

                .critical-alert-left {
                    display: flex;
                    align-items: center;
                    color: rgba(0,0,0,0.8);
                }

                .critical-alert-icon {
                    color: #ef4444;
                }

                .critical-alert-title {
                    margin-left: 8px;
                    font-size: 0.875rem;
                    font-weight: 600;
                }

                .critical-alert-btn {
                    background-color: #00B074;
                    color: white;
                    font-weight: 600;
                    font-size: 0.875rem;
                    padding: 4px 12px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }

                .critical-alert-btn:hover {
                    background-color: #1e8e69;
                }

                .critical-alert-overlay {
                    position: fixed;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: rgba(0,0,0,0.6);
                    z-index: 50;
                }

                .critical-alert-modal {
                    background-color: white;
                    padding: 24px;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                    width: 90%;
                    max-width: 400px;
                    position: relative;
                }

                .critical-alert-close {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background-color: #e5e7eb;
                    border: none;
                    border-radius: 50%;
                    padding: 4px;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }

                .critical-alert-close:hover {
                    background-color: #d1d5db;
                }

                .critical-alert-modal-title {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #ef4444;
                    margin-bottom: 12px;
                }

                .critical-alert-modal p {
                    font-size: 0.875rem;
                    color: #374151;
                    margin-bottom: 8px;
                }

                .critical-alert-modal-btn {
                    width: 100%;
                    background-color: #00B074;
                    color: white;
                    font-weight: 600;
                    padding: 8px 0;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                    margin-top: 12px;
                }

                .critical-alert-modal-btn:hover {
                    background-color: #1e8e69;
                }
            `}</style>
        </>
    );
}

export default CriticalAlert;
