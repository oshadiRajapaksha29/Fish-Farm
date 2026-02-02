import React from "react";
import { motion } from "framer-motion";
import { UserPlus, Truck, DollarSign, Briefcase, User } from "lucide-react";
import { Link } from "react-router-dom";

const registrations = [
    { id: 1, title: "Shop Owner Registration", description: "Register new shop owners to manage their businesses.", link: "/admin/user-registration/shop-owner", icon: <UserPlus />, bgColor: "#bfdbfe" },
    { id: 2, title: "Employee Registration", description: "Register employee to handle tasks.", link: "/admin/user-registration/employee", icon: <User />, bgColor: "#bbf7d0" },
    
];

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
};

function AdminDashboardRegistrationPage() {
    return (
        <div className="registration-page">
            <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="page-title"
            >
                User Registration
            </motion.h1>

            <motion.div initial="hidden" animate="visible" className="card-grid">
                {registrations.map(({ id, title, description, icon, link, bgColor }, index) => (
                    <RegistrationCard key={id} index={index} title={title} description={description} icon={icon} link={link} bgColor={bgColor} />
                ))}
            </motion.div>

            <style>{`
                .registration-page {
                    background-color: #f3f4f6;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    min-height: 100vh;
                    box-sizing: border-box;
                    margin-top: -70px;
                }

                .page-title {
                    font-size: 1.875rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 24px;
                    text-align: center;
                }

                @media(min-width: 768px) {
                    .page-title {
                        font-size: 2.25rem;
                    }
                }

                .card-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 24px;
                    width: 100%;
                    max-width: 768px;
                }

                @media(min-width: 768px) {
                    .card-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                .registration-card {
                    background-color: #ffffff;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    border-radius: 0.5rem;
                    padding: 24px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    cursor: pointer;
                    transition: box-shadow 0.3s, transform 0.3s;
                    text-decoration: none;
                    color: inherit;
                }

                .registration-card:hover {
                    box-shadow: 0 8px 12px rgba(0,0,0,0.15);
                    transform: scale(1.05);
                }

                .icon-wrapper {
                    padding: 12px;
                    border-radius: 9999px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .card-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 0;
                }

                .card-description {
                    font-size: 0.875rem;
                    color: #4b5563;
                    margin: 4px 0 0 0;
                }
            `}</style>
        </div>
    );
}

function RegistrationCard({ title, description, icon, link, index, bgColor }) {
    return (
        <Link to={link} className="registration-card">
            <div className="icon-wrapper" style={{ backgroundColor: bgColor }}>
                {React.cloneElement(icon, { size: 32, color: icon.props.color || "#000" })}
            </div>
            <div>
                <h3 className="card-title">{title}</h3>
                <p className="card-description">{description}</p>
            </div>
        </Link>
    );
}

export default AdminDashboardRegistrationPage;
