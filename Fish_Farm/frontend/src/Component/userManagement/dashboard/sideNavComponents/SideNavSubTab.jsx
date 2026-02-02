import React from 'react';
import { Link } from 'react-router-dom';

function SideNavSubTab({ activeTabUrl, tabName, url, sendActiveTabUrl }) {
  const isActive = url === activeTabUrl;

  return (
    <>
      <Link
        className={`side-nav-subtab${isActive ? ' side-nav-subtab--active' : ''}`}
        to={url}
        onClick={() => sendActiveTabUrl(url)}
        aria-current={isActive ? 'page' : undefined}
      >
        {tabName}
      </Link>

      <style>
        {`
          .side-nav-subtab {
            display: block;
            padding: 0.5rem;            /* p-2 */
            margin-left: 1rem;          /* ml-4 */
            margin-top: 0.25rem;        /* mt-1 */
            border-radius: 0.5rem;      /* rounded-lg */
            cursor: pointer;
            font-size: 0.875rem;        /* text-sm */
            text-decoration: none;
            color: #464255;             /* default text */
            transition: background-color 120ms ease, color 120ms ease;
          }

          .side-nav-subtab:hover {
            background-color: rgba(0, 176, 117, 0.08); /* subtle hover */
          }

          .side-nav-subtab--active {
            background-color: rgba(0, 176, 117, 0.15); /* active bg */
            color: #00B074;
            font-weight: 700;           /* bold */
          }
        `}
      </style>
    </>
  );
}

export default SideNavSubTab;
