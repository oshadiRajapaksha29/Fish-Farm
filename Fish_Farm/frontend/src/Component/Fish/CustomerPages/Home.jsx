import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Home.css";

/* 🔧 Inline helpers (no external api.js needed) */
const API_BASE =
  (process.env.REACT_APP_API_BASE || "http://localhost:5000").replace(/\/$/, "");

const toImageUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
};

const normalizeArray = (payload) => Array.isArray(payload) ? payload : (payload?.fish || []);

/**
 * Home: fetches all fishes, dedupes by Species, and shows one card per Species.
 * Clicking a species card goes to /species?name=<Species>
 */
export default function Home() {
  const [speciesList, setSpeciesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/fish`);
        const all = normalizeArray(res.data);

        // unique by Species; prefer one with a photo
        const map = new Map();
        for (const f of all) {
          if (!map.has(f.Species)) map.set(f.Species, f);
          else if (!map.get(f.Species).photo && f.photo) map.set(f.Species, f);
        }
        setSpeciesList([...map.values()]);
      } catch (e) {
        console.error(e);
        setErr("Unable to load species.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="home-container"><p>Loading species…</p></div>;
  if (err) return <div className="home-container"><p className="error">{err}</p></div>;

  return (
    <div className="home-container">
      {/* Hero header */}
      <div className="home-hero">
        <div className="home-hero-glow" aria-hidden="true" />
        <h1 className="home-title">Fish Collections</h1>
        <p className="home-subtitle">
          Hand-picked species for every aquarium—from friendly community fish to vibrant showpieces.
        </p>
        <div className="home-count">
          <span className="dot" /> {speciesList.length} species
        </div>
      </div>

      {/* Cards grid */}
      <div className="home-grid">
        {speciesList.map((item) => {
          const img = toImageUrl(item.photo);
          return (
            <Link
              key={item.Species}
              className="home-card"
              to={`/species?name=${encodeURIComponent(item.Species)}`}
              title={item.Species}
            >
              <div className="home-media">
                {img ? (
                  <img src={img} alt={item.Species} />
                ) : (
                  <div className="home-fallback">No image</div>
                )}
                <span className="home-card-overlay" aria-hidden="true" />
                <span className="home-card-shine" aria-hidden="true" />
              </div>

              <div className="home-card-body">
                <div className="home-card-title">{item.Species}</div>
                <div className="home-chip">Explore</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
