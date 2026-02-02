import React from 'react'

function SideNavHeader() {
  return (
    <>
      <div className="side-nav-header">
        <div className="image-text">
          <span className="image">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwR_-rajvPgl5tYcAZdA_dX2_SA__PStgKuQ&s"
              alt="logo"
            />
          </span>
          <div className="text header-text">
            <span className="name">Aqua Peak</span>
            <span className="profession">Fish Farm</span>
          </div>
        </div>
  
        <p className="side-nav-header__text">
          Aqua-Peak
        </p>
      </div>

      <style>
        {`
          .side-nav-header {
            width:100%; /* w-40 */
            padding: 12px 8px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .image-text {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }

          .image {
            flex-shrink: 0;
          }

          .image img {
            width: 32px;
            height: 32px;
            border-radius: 6px;
            object-fit: cover;
            border: 2px solid #0891b2;
            box-shadow: 0 2px 4px rgba(8, 145, 178, 0.2);
          }

          .header-text {
            display: flex;
            flex-direction: column;
            gap: 1px;
            min-width: 0;
          }

          .name {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            font-weight: 700;
            color: #0f172a;
            line-height: 1.2;
            letter-spacing: 0.2px;
          }

          .profession {
            font-family: 'Arial', sans-serif;
            font-size: 9px;
            font-weight: 500;
            color: #0891b2;
            line-height: 1.2;
            letter-spacing: 0.1px;
          }

          .side-nav-header__text {
            font-size: 8px;
            color: #B9BBBD;
            margin: 0;
            text-align: center;
            font-weight: 500;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }

          /* Hover effects */
          .side-nav-header:hover {
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
          }

          .side-nav-header:hover .image img {
            border-color: #06b6d4;
            transform: scale(1.05);
            transition: all 0.2s ease;
          }

          .side-nav-header:hover .name {
            color: #0891b2;
            transition: color 0.2s ease;
          }

          /* Mobile adjustments */
          @media (max-width: 768px) {
            .side-nav-header {
              width: 8rem;
              padding: 8px 6px;
            }
            
            .image img {
              width: 28px;
              height: 28px;
            }
            
            .name {
              font-size: 11px;
            }
            
            .profession {
              font-size: 8px;
            }
          }
        `}
      </style>
    </>
  )
}

export default SideNavHeader