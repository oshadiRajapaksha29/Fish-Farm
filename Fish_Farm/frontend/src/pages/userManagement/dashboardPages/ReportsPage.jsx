import React from 'react';
import ReportsGrid from '../../../Component/userManagement/dashboard/bodyComponents/ReportsGrid';

function ReportsPage() {
    const containerStyle = {
        marginLeft: '12px',
        marginRight: '32px',
        height: '100vh',
        border: '1px solid black',
        boxSizing: 'border-box',
        overflowY: 'auto', // optional if you want scrolling
    };

    return (
        <div style={containerStyle}>
            <ReportsGrid />
        </div>
    );
}

export default ReportsPage;
