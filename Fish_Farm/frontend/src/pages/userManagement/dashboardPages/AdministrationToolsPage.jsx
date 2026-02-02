import React, { useState } from 'react';
import {
    FileCog,
    RefreshCcw,
    ServerCrash,
    Settings2,
    ShieldAlert,
    XCircle,
    ChevronRight,
    Download,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';

const tools = [
    {
        name: 'Backup & Restore',
        icon: FileCog,
        description: 'Create or restore system backups.',
        color: 'emerald'
    },
    {
        name: 'Cache Management',
        icon: RefreshCcw,
        description: 'Clear or warm up system cache.',
        color: 'blue'
    },
    {
        name: 'Maintenance Mode',
        icon: ServerCrash,
        description: 'Enable or disable maintenance mode.',
        color: 'amber'
    },
    {
        name: 'Health Check',
        icon: Settings2,
        description: 'View system health and diagnostics.',
        color: 'indigo'
    },
    {
        name: 'ENV Editor',
        icon: Settings2,
        description: 'Edit environment variables safely.',
        color: 'teal'
    },
    {
        name: 'Security Breach',
        icon: ShieldAlert,
        description: 'Force logout all users from the system.',
        color: 'rose'
    },
];

const styles = `
* {
    box-sizing: border-box;
}

.app-container {
    min-height: 100vh;
    background-color: #f9fafb;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header */
.header {
    background: white;
    border-bottom: 1px solid #e5e7eb;
}

.header-content {
    max-width: 80rem;
    margin: 0 auto;
    padding: 0 1rem;
    height: 4rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin: 0;
}

/* Main content */
.main-content {
    max-width: 80rem;
    margin: 0 auto;
    padding: 2rem 1rem;
}

.tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.tool-card {
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1.25rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid #f3f4f6;
}

.tool-card:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tool-card-content {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
}

.tool-icon {
    padding: 0.75rem;
    border-radius: 0.5rem;
}

.tool-icon.emerald {
    background-color: #d1fae5;
    color: #065f46;
}

.tool-icon.blue {
    background-color: #dbeafe;
    color: #1e40af;
}

.tool-icon.amber {
    background-color: #fef3c7;
    color: #92400e;
}

.tool-icon.indigo {
    background-color: #e0e7ff;
    color: #3730a3;
}

.tool-icon.teal {
    background-color: #ccfbf1;
    color: #115e59;
}

.tool-icon.rose {
    background-color: #ffe4e6;
    color: #9f1239;
}

.tool-details {
    flex: 1;
}

.tool-name {
    font-size: 1.125rem;
    font-weight: 500;
    color: #111827;
    margin: 0 0 0.25rem 0;
}

.tool-description {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
}

.chevron-icon {
    color: #9ca3af;
    transition: color 0.2s ease;
}

.tool-card:hover .chevron-icon {
    color: #6b7280;
}

/* Modal */
.modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
    padding: 1rem;
}

.modal {
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 42rem;
    overflow: hidden;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem;
    border-bottom: 1px solid #e5e7eb;
}

.modal-title-container {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.modal-icon {
    padding: 0.5rem;
    border-radius: 0.5rem;
}

.modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
}

.close-button {
    padding: 0.25rem;
    border-radius: 50%;
    background: none;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.close-button:hover {
    background-color: #f3f4f6;
}

.modal-content {
    padding: 1.5rem;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    padding: 1.25rem;
    border-top: 1px solid #e5e7eb;
    background-color: #f9fafb;
}

/* Tool UI Styles */
.tool-ui {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.alert {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
}

.alert.emerald {
    color: #065f46;
    background-color: #ecfdf5;
}

.alert.blue {
    color: #1e40af;
    background-color: #eff6ff;
}

.alert.amber {
    color: #92400e;
    background-color: #fffbeb;
}

.alert.teal {
    color: #115e59;
    background-color: #f0fdfa;
}

.alert.rose {
    color: #9f1239;
    background-color: #fff1f2;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.section-title {
    font-size: 1.125rem;
    font-weight: 500;
    margin: 0;
}

.button {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.button.primary.emerald {
    background-color: #059669;
    color: white;
}

.button.primary.emerald:hover {
    background-color: #047857;
}

.button.primary.blue {
    background-color: #2563eb;
    color: white;
}

.button.primary.blue:hover {
    background-color: #1d4ed8;
}

.button.primary.amber {
    background-color: #d97706;
    color: white;
}

.button.primary.amber:hover {
    background-color: #b45309;
}

.button.primary.indigo {
    background-color: #4f46e5;
    color: white;
}

.button.primary.indigo:hover {
    background-color: #4338ca;
}

.button.primary.teal {
    background-color: #0d9488;
    color: white;
}

.button.primary.teal:hover {
    background-color: #0f766e;
}

.button.primary.rose {
    background-color: #dc2626;
    color: white;
}

.button.primary.rose:hover {
    background-color: #b91c1c;
}

.button.primary.green {
    background-color: #16a34a;
    color: white;
}

.button.primary.green:hover {
    background-color: #15803d;
}

.button.secondary {
    background-color: #e5e7eb;
    color: #374151;
}

.button.secondary:hover {
    background-color: #d1d5db;
}

.button.dark {
    background-color: #111827;
    color: white;
}

.button.dark:hover {
    background-color: #1f2937;
}

.button.text {
    background: none;
    padding: 0;
    font-weight: 500;
}

.button.text.emerald {
    color: #059669;
}

.button.text.emerald:hover {
    color: #047857;
}

/* Table */
.table-container {
    background-color: #f9fafb;
    border-radius: 0.5rem;
    overflow: hidden;
}

.table {
    width: 100%;
    border-collapse: collapse;
}

.table thead {
    background-color: #f3f4f6;
}

.table th {
    padding: 0.75rem 1.5rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 500;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.table th:last-child {
    text-align: right;
}

.table tbody {
    background: white;
}

.table td {
    padding: 1rem 1.5rem;
    border-top: 1px solid #e5e7eb;
    font-size: 0.875rem;
}

.table tr:hover {
    background-color: #f9fafb;
}

.table .filename {
    font-weight: 500;
    color: #111827;
}

.table .size, .table .date {
    color: #6b7280;
}

.table .action {
    text-align: right;
}

/* Stats Grid */
.stats-section {
    background-color: #f9fafb;
    padding: 1rem;
    border-radius: 0.5rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-top: 0.5rem;
}

.stat-card {
    background: white;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-label {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
}

.stat-value {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
}

/* Buttons Row */
.buttons-row {
    display: flex;
    justify-content: space-between;
}

/* Status Section */
.status-section {
    background-color: #f9fafb;
    padding: 1.5rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.status-info h3 {
    font-size: 1.125rem;
    font-weight: 500;
    margin: 0;
}

.status-info p {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0.25rem 0 0 0;
}

.status-indicator {
    display: flex;
    align-items: center;
}

.status-dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    margin-right: 0.5rem;
}

.status-dot.enabled {
    background-color: #f59e0b;
}

.status-dot.disabled {
    background-color: #10b981;
}

.status-text {
    font-weight: 500;
}

/* System Overview */
.system-status {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.75rem;
}

.status-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.status-item-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.status-item-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background-color: #10b981;
}

.status-item-status {
    font-size: 0.875rem;
    color: #059669;
    font-weight: 500;
}

/* Environment Variables */
.env-section {
    background-color: #f9fafb;
    padding: 1rem;
    border-radius: 0.5rem;
}

.env-vars {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 0.75rem;
}

.env-var-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.env-label {
    width: 33.333333%;
}

.env-label label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
}

.env-input {
    width: 66.666667%;
}

.env-input input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 0.875rem;
}

.env-input input:focus {
    outline: none;
    border-color: #0d9488;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
}

.env-actions {
    display: flex;
    justify-content: flex-end;
}

/* Security Section */
.security-warning {
    color: #9f1239;
    background-color: #fff1f2;
    font-weight: 500;
}

.security-section {
    background-color: #f9fafb;
    padding: 1.5rem;
    border-radius: 0.5rem;
}

.security-title {
    font-size: 1.125rem;
    font-weight: 500;
    color: #be123c;
    margin: 0 0 0.5rem 0;
}

.security-description {
    color: #4b5563;
    margin-bottom: 1rem;
}

.confirmation-box {
    background-color: #fff1f2;
    border: 1px solid #fecaca;
    padding: 1rem;
    border-radius: 0.5rem;
}

.confirmation-box p {
    font-size: 0.875rem;
    color: #be123c;
    margin-bottom: 0.5rem;
}

.confirmation-box input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
}

.confirmation-box input:focus {
    outline: none;
    border-color: #dc2626;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.security-actions {
    display: flex;
    justify-content: flex-end;
}

/* Toast */
.toast {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 50;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    color: white;
}

.toast.success {
    background-color: #059669;
}

.toast.warning {
    background-color: #d97706;
}

.toast.info {
    background-color: #2563eb;
}

.toast p {
    margin: 0;
}

@media (max-width: 768px) {
    .tools-grid {
        grid-template-columns: 1fr;
    }
    
    .modal {
        margin: 1rem;
    }
    
    .stats-grid {
        grid-template-columns: 1fr;
    }
    
    .buttons-row {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .status-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
    
    .env-var-row {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .env-label,
    .env-input {
        width: 100%;
    }
}
`;

export default function AdministrationToolsPage() {
    const [activeTool, setActiveTool] = useState(null);
    const [backups, setBackups] = useState([
        { name: "backup_2025-05-01.zip", size: "1.2 GB", date: "May 1, 2025" },
        { name: "backup_2025-04-20.zip", size: "1.1 GB", date: "April 20, 2025" }
    ]);
    const [envVars, setEnvVars] = useState({ 
        APP_ENV: "production", 
        DEBUG: "false", 
        API_TIMEOUT: "30000", 
        CACHE_TTL: "3600" 
    });
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCreateBackup = () => {
        const newBackup = {
            name: `backup_${new Date().toISOString().slice(0, 10)}.zip`,
            size: "1.3 GB",
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
        setBackups([newBackup, ...backups]);
        showToast("Backup created successfully");
    };

    const handleRestoreBackup = (file) => {
        showToast(`Restoring from ${file.name}...`, 'info');
    };

    const handleClearCache = () => {
        showToast("Cache cleared successfully");
    };

    const handleToggleMaintenance = () => {
        setMaintenanceMode(!maintenanceMode);
        showToast(`Maintenance mode ${!maintenanceMode ? 'enabled' : 'disabled'}`);
    };

    const handleHealthCheck = () => {
        showToast("System health check completed. All systems operational.");
    };

    const handleEnvChange = (key, value) => {
        setEnvVars({ ...envVars, [key]: value });
    };

    const handleSaveEnv = () => {
        showToast("Environment variables updated successfully");
    };

    const handleSecurityBreach = () => {
        showToast("All users have been logged out", "warning");
    };

    const renderToolUI = () => {
        switch (activeTool) {
            case 'Backup & Restore':
                return (
                    <div className="tool-ui">
                        <div className="alert emerald">
                            <AlertTriangle size={20} />
                            <p>Backups contain sensitive data. Ensure proper authorization before restoration.</p>
                        </div>

                        <div className="section-header">
                            <h3 className="section-title">Create New Backup</h3>
                            <button
                                onClick={handleCreateBackup}
                                className="button primary emerald"
                            >
                                <FileCog size={16} />
                                Create Backup
                            </button>
                        </div>

                        <div>
                            <h3 className="section-title" style={{marginBottom: '0.75rem'}}>Available Backups</h3>
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Filename</th>
                                            <th>Size</th>
                                            <th>Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {backups.map((file, idx) => (
                                            <tr key={idx}>
                                                <td className="filename">{file.name}</td>
                                                <td className="size">{file.size}</td>
                                                <td className="date">{file.date}</td>
                                                <td className="action">
                                                    <button
                                                        onClick={() => handleRestoreBackup(file)}
                                                        className="button text emerald"
                                                    >
                                                        <Download size={16} />
                                                        Restore
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case 'Cache Management':
                return (
                    <div className="tool-ui">
                        <div className="alert blue">
                            <AlertTriangle size={20} />
                            <p>Clearing cache may temporarily slow down the system as it rebuilds.</p>
                        </div>

                        <div className="stats-section">
                            <h3 className="section-title">Cache Statistics</h3>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <p className="stat-label">Memory Usage</p>
                                    <p className="stat-value">248 MB</p>
                                </div>
                                <div className="stat-card">
                                    <p className="stat-label">Items Cached</p>
                                    <p className="stat-value">1,435</p>
                                </div>
                                <div className="stat-card">
                                    <p className="stat-label">Hit Ratio</p>
                                    <p className="stat-value">94.2%</p>
                                </div>
                            </div>
                        </div>

                        <div className="buttons-row">
                            <button
                                onClick={handleClearCache}
                                className="button primary blue"
                            >
                                <RefreshCcw size={16} />
                                Clear All Cache
                            </button>

                            <button className="button secondary">
                                Warm Cache
                            </button>
                        </div>
                    </div>
                );

            case 'Maintenance Mode':
                return (
                    <div className="tool-ui">
                        <div className="alert amber">
                            <AlertTriangle size={20} />
                            <p>Enabling maintenance mode will disconnect all users.</p>
                        </div>

                        <div className="status-section">
                            <div className="status-info">
                                <h3>Maintenance Mode</h3>
                                <p>
                                    {maintenanceMode
                                        ? "Your site is currently in maintenance mode. Only administrators can access it."
                                        : "Your site is currently live and accessible to all users."}
                                </p>
                            </div>

                            <div className="status-indicator">
                                <span className={`status-dot ${maintenanceMode ? 'enabled' : 'disabled'}`}></span>
                                <span className="status-text">{maintenanceMode ? 'Enabled' : 'Disabled'}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleToggleMaintenance}
                            className={`button primary ${maintenanceMode ? 'green' : 'amber'}`}
                        >
                            <ServerCrash size={16} />
                            {maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
                        </button>
                    </div>
                );

            case 'Health Check':
                return (
                    <div className="tool-ui">
                        <div className="stats-section">
                            <h3 className="section-title">System Overview</h3>
                            <div className="system-status">
                                <div className="status-item">
                                    <div className="status-item-left">
                                        <div className="status-item-dot"></div>
                                        <span>Database</span>
                                    </div>
                                    <span className="status-item-status">Operational</span>
                                </div>
                                <div className="status-item">
                                    <div className="status-item-left">
                                        <div className="status-item-dot"></div>
                                        <span>API Services</span>
                                    </div>
                                    <span className="status-item-status">Operational</span>
                                </div>
                                <div className="status-item">
                                    <div className="status-item-left">
                                        <div className="status-item-dot"></div>
                                        <span>File Storage</span>
                                    </div>
                                    <span className="status-item-status">Operational</span>
                                </div>
                                <div className="status-item">
                                    <div className="status-item-left">
                                        <div className="status-item-dot"></div>
                                        <span>Authentication</span>
                                    </div>
                                    <span className="status-item-status">Operational</span>
                                </div>
                            </div>
                        </div>

                        <div className="buttons-row">
                            <button
                                onClick={handleHealthCheck}
                                className="button primary indigo"
                            >
                                <RefreshCcw size={16} />
                                Run Health Check
                            </button>

                            <button className="button secondary">
                                View Detailed Report
                            </button>
                        </div>
                    </div>
                );

            case 'ENV Editor':
                return (
                    <div className="tool-ui">
                        <div className="alert teal">
                            <AlertTriangle size={20} />
                            <p>Changing environment variables may require a system restart.</p>
                        </div>

                        <div className="env-section">
                            <h3 className="section-title">Environment Variables</h3>
                            <div className="env-vars">
                                {Object.entries(envVars).map(([key, value]) => (
                                    <div key={key} className="env-var-row">
                                        <div className="env-label">
                                            <label>{key}</label>
                                        </div>
                                        <div className="env-input">
                                            <input
                                                value={value}
                                                onChange={(e) => handleEnvChange(key, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="env-actions">
                            <button
                                onClick={handleSaveEnv}
                                className="button primary teal"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                );

            case 'Security Breach':
                return (
                    <div className="tool-ui">
                        <div className="alert rose security-warning">
                            <AlertTriangle size={20} />
                            <p>WARNING: This action is irreversible and will affect all users.</p>
                        </div>

                        <div className="security-section">
                            <h3 className="security-title">Force Logout All Users</h3>
                            <p className="security-description">
                                Use this option only in case of a security breach. All users will be immediately logged out and required to re-authenticate.
                                All active sessions will be terminated. This cannot be undone.
                            </p>

                            <div className="confirmation-box">
                                <p>To confirm this action, type "FORCE LOGOUT" in the field below.</p>
                                <input placeholder="Type FORCE LOGOUT to confirm" />
                            </div>
                        </div>

                        <div className="security-actions">
                            <button
                                onClick={handleSecurityBreach}
                                className="button primary rose"
                            >
                                <ShieldAlert size={16} />
                                Force Logout All Users
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <style>{styles}</style>
            <div className="app-container">
                {/* Header */}
                <div className="header">
                    <div className="header-content">
                        <h1 className="header-title">Administration Tools</h1>
                    </div>
                </div>

                {/* Main content */}
                <div className="main-content">
                    <div className="tools-grid">
                        {tools.map((tool) => (
                            <div
                                key={tool.name}
                                onClick={() => setActiveTool(tool.name)}
                                className="tool-card"
                            >
                                <div className="tool-card-content">
                                    <div className={`tool-icon ${tool.color}`}>
                                        <tool.icon size={24} />
                                    </div>
                                    <div className="tool-details">
                                        <h3 className="tool-name">{tool.name}</h3>
                                        <p className="tool-description">{tool.description}</p>
                                    </div>
                                    <ChevronRight className="chevron-icon" size={20} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modal */}
                {activeTool && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <div className="modal-header">
                                <div className="modal-title-container">
                                    {tools.find(tool => tool.name === activeTool) && (
                                        <div className={`modal-icon tool-icon ${tools.find(tool => tool.name === activeTool).color}`}>
                                            {React.createElement(tools.find(tool => tool.name === activeTool).icon, { size: 20 })}
                                        </div>
                                    )}
                                    <h2 className="modal-title">{activeTool}</h2>
                                </div>
                                <button
                                    onClick={() => setActiveTool(null)}
                                    className="close-button"
                                >
                                    <XCircle size={24} color="#9ca3af" />
                                </button>
                            </div>

                            <div className="modal-content">
                                {renderToolUI()}
                            </div>

                            <div className="modal-footer">
                                <button
                                    onClick={() => setActiveTool(null)}
                                    className="button dark"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast */}
                {toast && (
                    <div className={`toast ${toast.type}`}>
                        {toast.type === 'success' && <CheckCircle size={18} />}
                        {toast.type === 'warning' && <AlertTriangle size={18} />}
                        {toast.type === 'info' && <AlertTriangle size={18} />}
                        <p>{toast.message}</p>
                    </div>
                )}
            </div>
        </>
    );
}