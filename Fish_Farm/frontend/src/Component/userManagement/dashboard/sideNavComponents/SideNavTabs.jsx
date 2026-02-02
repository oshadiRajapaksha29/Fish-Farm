import React, { useState, useEffect } from 'react';
import SideNavTab from './SideNavTab';
import { CheckedGrid, Configs, FileIcon, Glob2, People, PersonLinesFill } from '../../icons/Icons';
import SideNavSubTab from './SideNavSubTab';
import { useLocation } from 'react-router-dom';

function SideNavTabs() {
  const location = useLocation();
  const [activeTabUrl, setActiveTabUrl] = useState(location.pathname);

  useEffect(() => {
    setActiveTabUrl(location.pathname);
  }, [location.pathname]);

  const recieveActiveTabUrl = (url) => {
    setActiveTabUrl(url);
  };

  return (
    <>
      <div className="side-nav-tabs">
        <SideNavTab
          sendActiveTabUrl={recieveActiveTabUrl}
          icon={<CheckedGrid />}
          active={activeTabUrl}
          tabName="Dashboard"
          url="/admin/dashboard"
        />

        <SideNavTab
          sendActiveTabUrl={recieveActiveTabUrl}
          icon={<People />}
          active={activeTabUrl}
          tabName="Account Management"
          url="/admin/account-management"
        />

        <SideNavTab
          allowSubRoutes={true}
          sendActiveTabUrl={recieveActiveTabUrl}
          icon={<PersonLinesFill />}
          active={activeTabUrl}
          tabName="User Registration"
          url="/admin/user-registration"
        >
          <SideNavSubTab sendActiveTabUrl={recieveActiveTabUrl} activeTabUrl={activeTabUrl} tabName="Shop Owners" url="/admin/user-registration/shop-owner" />
          <SideNavSubTab sendActiveTabUrl={recieveActiveTabUrl} activeTabUrl={activeTabUrl} tabName="Employee managers" url="/admin/user-registration/employee" />
    
        </SideNavTab>

        <SideNavTab
          sendActiveTabUrl={recieveActiveTabUrl}
          icon={<FileIcon />}
          active={activeTabUrl}
          tabName="Reports"
          url="/admin/reports"
        />

        <SideNavTab
          sendActiveTabUrl={recieveActiveTabUrl}
          icon={<Glob2 />}
          active={activeTabUrl}
          tabName="Activity Monitoring"
          url="/admin/activity-monitoring"
        />
      </div>

      <style>
        {`
          .side-nav-tabs {
            width: 100%;                    /* w-full */
            display: flex;                  /* flex */
            flex-direction: column;         /* flex-col */
                    /* justify-center */
            gap: 0.25rem;                   /* gap-1 */
            margin-top: 1.25rem;            /* mt-5 */
          }
        `}
      </style>
    </>
  );
}

export default SideNavTabs;
