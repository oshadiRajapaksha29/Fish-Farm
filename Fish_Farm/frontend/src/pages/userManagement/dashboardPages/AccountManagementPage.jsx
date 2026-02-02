import React from 'react';
import AccountsTable from '../../../Component/userManagement/dashboard/bodyComponents/AccountsTable';

function AccountManagementPage() {
    return (
        <div className="account-management-page">
            <AccountsTable />
            <style>{`
                .account-management-page {
                    margin-left: 12px;   /* equivalent to ml-3 */
                    margin-right: 24px;  /* equivalent to mr-6 */
                }
            `}</style>
        </div>
    );
}

export default AccountManagementPage;
