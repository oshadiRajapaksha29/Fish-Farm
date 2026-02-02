import React from 'react';
import ServerInfo from '../../../Component/userManagement/dashboard/bodyComponents/ServerInfo';

function SystemConfigurationsPage() {
    const containerStyle = {
        padding: '12px', // equivalent to Tailwind's p-3
        boxSizing: 'border-box',
    };

    return (
        <div style={containerStyle}>
            <ServerInfo />
        </div>
    );
}

export default SystemConfigurationsPage;
