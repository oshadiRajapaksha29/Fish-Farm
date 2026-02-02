import React from 'react'
import { Glob, ClockHistory, Telephone, Envelop } from '../../icons/Icons'
// import FishFarmer from '../../../../assets/userManagement/fish-farmer.svg'

function SideNavFooter() {
  return (
    <>
      <div className="side-nav-footer">

        {/* gradient overlay */}
        <div className="side-nav-footer__overlay"></div>

        {/* main content */}
        <div className="side-nav-footer__content">
          <div>
            <h3 className="side-nav-footer__title">Aqua Peak</h3>
          </div>

          <div className="side-nav-footer__info">
            <div className="side-nav-footer__row">
              <Glob width="12px" height="12px" fill="#ffffff" />
              <span className="side-nav-footer__text">Version: 2.1.0</span>
            </div>
            <div className="side-nav-footer__row">
              <ClockHistory width="12px" height="12px" fill="#ffffff" />
              <span className="side-nav-footer__text">Last Updated: August 2025</span>
            </div>
            <div className="side-nav-footer__row">
              <Telephone width="12px" height="12px" fill="#ffffff" />
              <span className="side-nav-footer__text">Aqua Helpline: +94 25 222 3456</span>
            </div>
            <div className="side-nav-footer__row">
              <Envelop width="12px" height="12px" fill="#ffffff" />
              <span className="side-nav-footer__text">Support: aquapeak01@gmail.com</span>
            </div>
          </div>

          <div>
            <p className="side-nav-footer__copyright">
              © 2025 AquaLanka Systems. All Rights Reserved.
            </p>
          </div>
        </div>

        {/* fish farmer image */}
        {/* <img className="side-nav-footer__img" src={FishFarmer} alt="Fish Farmer" /> */}
      </div>

      <style>
        {`
          .side-nav-footer {
            background: linear-gradient(135deg, #0077be 0%, #004d7a 50%, #002d4a 100%);
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            border-top-left-radius: 0.75rem;
            border-top-right-radius: 0.75rem;
            overflow: hidden;
            box-shadow: 0 -4px 20px rgba(0, 119, 190, 0.3);
          }

          .side-nav-footer__overlay {
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
            z-index: 1;
            position: absolute;
            top: 0;
            left: 0;
            border-top-left-radius: 0.75rem;
            border-top-right-radius: 0.75rem;
          }

          .side-nav-footer__content {
            color: #ffffff;
            height: 100%;
            width: 85%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            z-index: 2;
            text-align: center;
            padding: 1rem 0;
          }

          .side-nav-footer__title {
            font-size: 22px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            letter-spacing: 0.5px;
          }

          .side-nav-footer__info {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 0.25rem;
            margin-left: -1.5rem;
          }

          .side-nav-footer__row {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            transition: transform 0.2s ease;
          }

          .side-nav-footer__row:hover {
            transform: translateX(2px);
          }

          .side-nav-footer__text {
            font-size: 11px;
            font-weight: 400;
            color: #e8f4f8;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          }

          .side-nav-footer__copyright {
            font-size: 10px;
            color: #b8d9e8;
            margin: 0;
            font-weight: 300;
            opacity: 0.9;
          }

          .side-nav-footer__img {
            position: absolute;
            right: -2rem;
            bottom: 0;
            z-index: 1;
            opacity: 0.7;
            filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
          }

          /* Fish-themed decorative elements */
          .side-nav-footer::before {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 20%;
            width: 60%;
            height: 20px;
            background: repeating-linear-gradient(
              90deg,
              transparent,
              transparent 10px,
              rgba(255, 255, 255, 0.1) 10px,
              rgba(255, 255, 255, 0.1) 12px
            );
            z-index: 0;
          }
        `}
      </style>
    </>
  )
}

export default SideNavFooter