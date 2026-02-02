import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import "./Species.css";

/* Inline helpers */
const API_BASE = (process.env.REACT_APP_API_BASE || "http://localhost:5000").replace(/\/$/, "");
const toImageUrl = (path) => (!path ? "" : (path.startsWith("http") ? path : `${API_BASE}${path}`));
const normalizeArray = (payload) => Array.isArray(payload) ? payload : (payload?.fish || []);

export default function Species() {
  const [params] = useSearchParams();
  const speciesName = params.get("name") || "";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // 🔽 Filters / sorting UI state
  const [availability, setAvailability] = useState("all"); // all | in | out
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [sortBy, setSortBy] = useState("featured"); // featured | bestseller | alpha-asc | alpha-desc | price-asc | price-desc

  useEffect(() => {
    if (!speciesName) { setErr("No species provided"); setLoading(false); return; }
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/fish`, { params: { species: speciesName } });
        const list = normalizeArray(res.data);
        setItems(list);
      } catch (e) {
        console.error(e);
        setErr("Unable to load fishes for this species.");
      } finally {
        setLoading(false);
      }
    })();
  }, [speciesName]);

  // 🔽 Apply filters + sorting (client side)
  const filtered = useMemo(() => {
    let arr = items.slice();

    // Availability
    if (availability === "in") {
      arr = arr.filter((f) => (f?.Quantity ?? 0) > 0);
    } else if (availability === "out") {
      arr = arr.filter((f) => (f?.Quantity ?? 0) === 0);
    }

    // Price range
    const min = priceFrom === "" ? null : Number(priceFrom);
    const max = priceTo === "" ? null : Number(priceTo);
    if (min !== null) arr = arr.filter((f) => Number(f?.PricePerCouple ?? 0) >= min);
    if (max !== null) arr = arr.filter((f) => Number(f?.PricePerCouple ?? 0) <= max);

    // Sort
    switch (sortBy) {
      case "alpha-asc":
        arr.sort((a, b) => (a.subSpecies || "").localeCompare(b.subSpecies || ""));
        break;
      case "alpha-desc":
        arr.sort((a, b) => (b.subSpecies || "").localeCompare(a.subSpecies || ""));
        break;
      case "price-asc":
        arr.sort((a, b) => Number(a?.PricePerCouple ?? 0) - Number(b?.PricePerCouple ?? 0));
        break;
      case "price-desc":
        arr.sort((a, b) => Number(b?.PricePerCouple ?? 0) - Number(a?.PricePerCouple ?? 0));
        break;
      case "bestseller":
        // Proxy for "best selling": higher Quantity first
        arr.sort((a, b) => Number(b?.Quantity ?? 0) - Number(a?.Quantity ?? 0));
        break;
      case "featured":
      default:
        // keep original order
        break;
    }

    return arr;
  }, [items, availability, priceFrom, priceTo, sortBy]);

  return (
    <>
      <div className="species-container">
        {loading && <p>Loading…</p>}
        {err && <p className="error">{err}</p>}

        {!loading && !err && (
          <>
            <h1 className="species-title">{speciesName}</h1>

            {/* 🔽 Toolbar: Filters + Sort + Count */}
            <div className="species-toolbar">
              <div className="toolbar-left">
                {/* Availability */}
                <div className="toolbar-field">
                  <div className="filter-label">
                    <span className="availability-icon">📦</span>
                    Availability
                  </div>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="availability-select"
                  >
                    <option value="all">All</option>
                    <option value="in">In Stock</option>
                    <option value="out">Out of Stock</option>
                  </select>
                </div>

                {/* Price range */}
                <div className="toolbar-field">
                  <div className="filter-label">
                    <span className="price-icon">💰</span>
                    Price
                  </div>
                  <div className="price-range">
                    <input
                      type="number"
                      min="0"
                      placeholder="From"
                      value={priceFrom}
                      onChange={(e) => setPriceFrom(e.target.value)}
                      className="price-input"
                    />
                    <span className="price-sep">–</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="To"
                      value={priceTo}
                      onChange={(e) => setPriceTo(e.target.value)}
                      className="price-input"
                    />
                  </div>
                </div>
              </div>

              <div className="toolbar-right">
                <div className="toolbar-field">
                  <div className="filter-label">
                    <span className="sort-icon">🔃</span>
                    Sort by
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="featured">Featured</option>
                    <option value="bestseller">Best selling</option>
                    <option value="alpha-asc">Alphabetically (A–Z)</option>
                    <option value="alpha-desc">Alphabetically (Z–A)</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>

                <div className="toolbar-count">
                  {filtered.length} products
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="species-grid">
              {filtered.map((f) => {
                const img = toImageUrl(f.photo);
                return (
                  <Link key={f._id} className="species-card" to={`/fish/${f._id}`} title={f.subSpecies}>
                    {img ? (
                      <img src={img} alt={f.subSpecies} />
                    ) : (
                      <div className="species-fallback">📷 No image</div>
                    )}
                    <div className="species-body">
                      <div className="species-name">{f.subSpecies}</div>
                      <div className="species-price">💰 Rs. {f.PricePerCouple}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}