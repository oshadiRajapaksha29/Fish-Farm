//Accessories.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Accessories.css";

const URL = "http://localhost:5000/accessories";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

const Accessories = () => {
  const [accessories, setAccessories] = useState([]);

  useEffect(() => {
    fetchHandler().then((data) => setAccessories(data.accessories));
  }, []);

  return (
    <div className="ha_container">
      <h2 className="ha_title">Accessories</h2>
      <div className="ha_grid">
        {accessories.map((acc) => (
          <div className="ha_card" key={acc._id}>
            {/* ✅ Corrected path */}
            <Link to={`/shop/accessories/${acc._id}`}>
              <img
                src={`http://localhost:5000/${acc.imageProduct}`}
                alt={acc.product}
                className="ha_image"
              />
            </Link>

            <h3 className="ha_name">{acc.product}</h3>
            <div className="ha_price_section">
              {acc.specialPrice ? (
                <>
                  <span className="ha_price">Rs.{acc.price}</span>
                  <span className="ha_special_price">Rs.{acc.specialPrice}</span>
                </>
              ) : (
                <span className="ha_normal_price">Rs.{acc.price}</span>
              )}
            </div>
            <p
              className={`ha_stock ${
                acc.stock > 0 ? "available" : "not-available"
              }`}
            >
              {acc.stock > 0
                ? `Available (${acc.stock})`
                : `Not Available (${acc.stock})`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Accessories;
