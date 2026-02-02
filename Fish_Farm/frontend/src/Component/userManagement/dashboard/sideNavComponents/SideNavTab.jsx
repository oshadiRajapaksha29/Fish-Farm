import React from 'react';
import { Link } from 'react-router-dom';

function SideNavTab({ url, active, icon, tabName, sendActiveTabUrl, children, allowSubRoutes = false }) {

  const isActive = allowSubRoutes ? active.startsWith(url) : url === active;

  return (
    <>
      <div className="side-nav-tab">
        <Link
          className={`side-nav-tab__link${isActive ? ' side-nav-tab__link--active' : ''}`}
          to={url}
          onClick={() => sendActiveTabUrl(url)}
        >
          <div className="side-nav-tab__icon">{icon}</div>
          <div className="side-nav-tab__text">{tabName}</div>
        </Link>

        {isActive && children && <div className="side-nav-tab__children">{children}</div>}
      </div>

      <style>
        {`
          .side-nav-tab {
            width: 100%;
          }

          .side-nav-tab__link {
            display: flex;
            align-items: center;
            padding: 0.5rem;               /* p-2 */
            margin-left: 0.5rem;           /* ml-2 */
            border-radius: 0.5rem;         /* rounded-lg */
            cursor: pointer;
            text-decoration: none;
            color: #464255;                /* default text */
            transition: background-color 120ms ease, color 120ms ease;
          }

          .side-nav-tab__link:hover {
            background-color: rgba(0, 176, 117, 0.08);
          }

          .side-nav-tab__link--active {
            background-color: rgba(0, 176, 117, 0.15); /* #00b07527 */
            color: #00B074;
            font-weight: 700;              /* bold */
          }

          .side-nav-tab__icon {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 1px;
            margin-right: 0.5rem;
          }

          .side-nav-tab__text {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
          }

          .side-nav-tab__children {
            margin-left: 1.5rem; /* ml-6 */
          }
        `}
      </style>
    </>
  );
}

export default SideNavTab;
