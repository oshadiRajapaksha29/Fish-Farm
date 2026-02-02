



import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ShopFoodMedicine.css";

const API = "http://localhost:5000/foodAndMedicine";

export default function ShopFoodMedicine() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]); // all products
  // Filters
  const [availability, setAvailability] = useState("all"); // all | in | out
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("featured"); // featured | price-asc | price-desc | name-asc | name-desc | newest
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
  const res = await axios.get(API);
  // Keep full list; filter by availability via UI
  setList(res.data.foodAndMedicine || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Utility functions and hooks must be defined before any conditional returns
  const priceOf = (p) => Number(p?.price ?? 0);
  
  // Move useMemo before conditional returns
  const filtered = useMemo(() => {
    // If still loading, return empty array
    if (loading) return [];
    
    let arr = Array.isArray(list) ? [...list] : [];

    // Availability
    if (availability === "in") arr = arr.filter(p => Number(p.stock) > 0);
    if (availability === "out") arr = arr.filter(p => Number(p.stock) <= 0);

    // Price range
    const min = minPrice !== "" ? Number(minPrice) : null;
    const max = maxPrice !== "" ? Number(maxPrice) : null;
    if (min !== null) arr = arr.filter(p => priceOf(p) >= min);
    if (max !== null) arr = arr.filter(p => priceOf(p) <= max);

    // Sort
    const byName = (a, b) => String(a.productName || "").localeCompare(String(b.productName || ""));
    const byDate = (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    const byPrice = (a, b) => priceOf(a) - priceOf(b);

    switch (sortBy) {
      case "price-asc":
        arr.sort(byPrice);
        break;
      case "price-desc":
        arr.sort((a, b) => byPrice(b, a));
        break;
      case "name-asc":
        arr.sort(byName);
        break;
      case "name-desc":
        arr.sort((a, b) => byName(b, a));
        break;
      case "newest":
        arr.sort(byDate);
        break;
      default:
        // featured: keep as-is
        break;
    }

    return arr;
  }, [list, availability, minPrice, maxPrice, sortBy, loading]);

  // Now we can safely use a conditional return
  if (loading) return <div className="r_s_f_m_loading">Loading</div>;

  return (
    <div className="r_s_f_m_page_wrapper">
      <div className="r_s_f_m_container">
      <h1 className="r_s_f_m_heading">Food & Medicine</h1>
      {/* Filters bar */}
      <div className="r_s_f_m_filters">
        <div className="r_s_f_m_filters_left">
          <div className="r_s_f_m_filter_group">
            <label>Availability</label>
            <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
              <option value="all">All</option>
              <option value="in">In stock</option>
              <option value="out">Out of stock</option>
            </select>
          </div>
          <div className="r_s_f_m_filter_group">
            <label>Price</label>
            <div className="r_s_f_m_price">
              <input
                type="number"
                placeholder="From"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min={0}
              />
              <span className="r_s_f_m_dash">–</span>
              <input
                type="number"
                placeholder="To"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min={0}
              />
            </div>
          </div>
        </div>
        <div className="r_s_f_m_filters_right">
          <div className="r_s_f_m_filter_group">
            <label>Sort by</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
          <div className="r_s_f_m_count">{filtered.length} products</div>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="r_s_f_m_empty">
          <div className="r_s_f_m_empty_icon">🐟</div>
          <p>No products available at the moment.</p>
        </div>
      ) : (
        <div className="r_s_f_m_grid">
          {filtered.map(p => (
            <div
              key={p._id}
              className="r_s_f_m_card"
              onClick={() => navigate(`/shop/food-medicine/${p._id}`)}
            >
              <div className="r_s_f_m_imgBox">
                {p.image && <img src={`http://localhost:5000/uploads/${p.image}`} alt={p.productName} />}
              </div>
              <h3>{p.productName}</h3>
              <div>{p.category} • {p.size}</div>
              <div>Rs. {p.price}</div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}