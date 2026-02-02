import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../../Component/Orders/Cart/CartContext";
import "./FishProductDetail.css";

const API_BASE = (process.env.REACT_APP_API_BASE || "http://localhost:5000").replace(/\/$/, "");
const toImageUrl = (p) => (!p ? "" : (p.startsWith("http") ? p : `${API_BASE}${p}`));

export default function FishProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, items } = useCart();

  const [fish, setFish] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Popup state
  const [popup, setPopup] = useState({ open: false, msg: "", type: "error" });

  const wrapRef = useRef(null);
  const [lensVisible, setLensVisible] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [lensSize, setLensSize] = useState(160);
  const ZOOM = 2.5;

  // Resize lens responsively
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const resize = () => {
      const rect = el.getBoundingClientRect();
      const base = Math.min(rect.width, rect.height);
      setLensSize(Math.max(96, Math.min(220, Math.round(base * 0.35))));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [mainImage]);

  const getRelativePoint = (clientX, clientY) => {
    const el = wrapRef.current;
    if (!el) return { x: 0, y: 0, rect: { width: 1, height: 1, left: 0, top: 0 } };
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    return { x, y, rect };
  };

  const handleEnter = () => setLensVisible(true);
  const handleLeave = () => setLensVisible(false);
  const handleMove = (e) => {
    const isTouch = e.type.startsWith("touch");
    let clientX, clientY;
    if (isTouch) {
      const t = e.touches[0] || e.changedTouches[0];
      if (!t) return;
      clientX = t.clientX; clientY = t.clientY;
    } else {
      clientX = e.clientX; clientY = e.clientY;
    }
    const { x, y } = getRelativePoint(clientX, clientY);
    setLensPos({ x, y });
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/fish/${id}`);
        const data = res.data;
        setFish(data);
        const hero = toImageUrl(data?.photo) || toImageUrl(data?.extraPhoto);
        setMainImage(hero);
      } catch (e) {
        console.error(e);
        setErr("Unable to load fish details.");
      }
    })();
  }, [id]);

  if (err) return <div className="AC_container"><p className="error">{err}</p></div>;
  if (!fish) return <h2 style={{ textAlign: "center" }}>Loading...</h2>;

  const galleryImages = [fish.photo, fish.extraPhoto].filter(Boolean).map(toImageUrl);

  const qtyAlreadyInCart = () => {
    const existing = items.find((item) => item._id === fish._id);
    return existing?.qty || 0;
  };

  const validateStock = (requested) => {
    const stock = fish.Quantity || 0;
    const inCart = qtyAlreadyInCart();
    const allowed = Math.max(0, stock - inCart);

    if (requested < 1) {
      setPopup({ open: true, msg: "Minimum quantity is 1.", type: "error" });
      return false;
    }
    if (requested > allowed) {
      const msg =
        allowed > 0
          ? `Only ${allowed} left in stock for ${fish.subSpecies}. You already have ${inCart} in your cart, and requested ${requested}.`
          : `Sorry, ${fish.subSpecies} is already at your cart limit. No more stock available.`;
      setPopup({ open: true, msg, type: "error" });
      return false;
    }
    return true;
  };

  // NEW: Function to update fish quantity in database
  const updateFishQuantity = async (fishId, quantityToReduce) => {
    try {
      const response = await axios.post(`${API_BASE}/fish/${fishId}/sell`, {
        qty: quantityToReduce
      });
      return response.data;
    } catch (error) {
      console.error("Error updating fish quantity:", error);
      throw new Error("Failed to update fish quantity in database");
    }
  };

  const addToCartHandler = async () => {
    const intQty = parseInt(qty || 1, 10);
    if (!validateStock(intQty)) return;

    setBusy(true);
    try {
      // First update the fish quantity in the database
      await updateFishQuantity(fish._id, intQty);

      const pickImage = fish.photo || fish.extraPhoto || "";
      let imageFile = null;
      if (pickImage) {
        const parts = pickImage.split("/");
        imageFile = parts[parts.length - 1] || null;
      }

      const cartItem = {
        _id: fish._id,
        productName: `${fish.subSpecies} (${fish.Species})`,
        price: fish.PricePerCouple,
        image: imageFile,
        stock: fish.Quantity - intQty, // Updated stock after reduction
        size: fish.Stage,
        category: "Fish",
      };

      addItem(cartItem, intQty);
      
      // Update local fish state to reflect the reduced quantity
      setFish(prev => ({
        ...prev,
        Quantity: prev.Quantity - intQty
      }));

      setPopup({ open: true, msg: `${fish.subSpecies} added to cart successfully!`, type: "success" });
    } catch (e) {
      console.error("addToCart error:", e);
      setPopup({ open: true, msg: "Failed to add to cart. Please try again.", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const buyNow = async () => {
    const intQty = parseInt(qty || 1, 10);
    if (!validateStock(intQty)) return;

    setBusy(true);
    try {
      // First update the fish quantity in the database
      await updateFishQuantity(fish._id, intQty);

      const pickImage = fish.photo || fish.extraPhoto || "";
      let imageFile = null;
      if (pickImage) {
        const parts = pickImage.split("/");
        imageFile = parts[parts.length - 1] || null;
      }

      const cartItem = {
        _id: fish._id,
        productName: `${fish.subSpecies} (${fish.Species})`,
        price: fish.PricePerCouple,
        image: imageFile,
        stock: fish.Quantity - intQty, // Updated stock after reduction
        size: fish.Stage,
        category: "Fish",
      };

      addItem(cartItem, intQty);
      
      // Update local fish state to reflect the reduced quantity
      setFish(prev => ({
        ...prev,
        Quantity: prev.Quantity - intQty
      }));

      navigate("/cart");
    } catch (e) {
      console.error("buyNow error:", e);
      setPopup({ open: true, msg: "Failed to process your request. Please try again.", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  // ✅ Quantity change validation
  const handleQtyChange = (next) => {
    const stock = fish.Quantity || 0;
    const inCart = qtyAlreadyInCart();
    const allowed = Math.max(0, stock - inCart);

    if (next < 1) {
      setQty(1);
      setPopup({ open: true, msg: "Minimum quantity is 1.", type: "error" });
      return;
    }
    if (next > allowed) {
      setQty(allowed > 0 ? allowed : 1);
      const msg =
        allowed > 0
          ? `Only ${allowed} left in stock for ${fish.subSpecies}.`
          : `No more stock available for ${fish.subSpecies}.`;
      setPopup({ open: true, msg, type: "error" });
      return;
    }
    setQty(next);
  };

  const lensStyle = (() => {
    const el = wrapRef.current;
    const rect = el ? el.getBoundingClientRect() : { width: 1, height: 1 };
    const { x, y } = lensPos;
    const half = lensSize / 2;
    const cx = Math.max(half, Math.min(rect.width - half, x));
    const cy = Math.max(half, Math.min(rect.height - half, y));
    const bgW = rect.width * ZOOM;
    const bgH = rect.height * ZOOM;
    const bgX = (cx / rect.width) * 100;
    const bgY = (cy / rect.height) * 100;
    return {
      width: `${lensSize}px`,
      height: `${lensSize}px`,
      transform: `translate(${cx - half}px, ${cy - half}px)`,
      backgroundImage: mainImage ? `url("${mainImage}")` : "none",
      backgroundSize: `${bgW}px ${bgH}px`,
      backgroundPosition: `${bgX}% ${bgY}%`,
    };
  })();

  const waterText = `Use only Borewell water for Gold fish, Koi, Guppy, cichlids.
RO water recommended for Tetras/shrimps/rasboras.`;

  const shippingText = `Prepaid: 2-3 days. COD: 3-5 days. Ready stock: 24-48hrs.`;

  const careText = `Weekly 30% water change. Check compatibility before mixing fishes.`;

  return (
    <>
      {popup.open && (
        <div className="ac-pop">
          <div className="ac-pop__backdrop" onClick={() => setPopup({ open: false, msg: "", type: popup.type })} />
          <div className="ac-pop__box" role="alertdialog" aria-live="assertive" data-type={popup.type}>
            <div className="ac-pop__title">
              {popup.type === "success" ? "Success" : "Quantity not available"}
            </div>
            <div className="ac-pop__msg">{popup.msg}</div>
            <button className="ac-pop__btn" onClick={() => setPopup({ open: false, msg: "", type: popup.type })}>
              Okay
            </button>
          </div>
        </div>
      )}

      <div className="AC_container">
        <div className="AC_media">
          <div className="AC_imageBox">
            {mainImage ? (
              <div
                className="magnifier-wrap"
                ref={wrapRef}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
                onMouseMove={handleMove}
                onTouchStart={handleEnter}
                onTouchEnd={handleLeave}
                onTouchMove={(e) => { e.preventDefault(); handleMove(e); }}
              >
                <img className="AC_mainImage" src={mainImage} alt={fish.subSpecies} draggable="false" />
                {lensVisible && <div className="magnifier-lens" style={lensStyle} aria-hidden="true" />}
              </div>
            ) : <div className="AC_fallback">No image</div>}
          </div>
          {galleryImages.length > 0 && (
            <div className="AC_gallery">
              {galleryImages.map((src, i) => (
                <button key={i} type="button" className={`AC_thumb ${src === mainImage ? "is-active" : ""}`} onClick={() => setMainImage(src)}>
                  <img src={src} alt={`thumb-${i}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="AC_info">
          <h1 className="AC_name">{fish.subSpecies} <span className="AC_muted">({fish.Species})</span></h1>
          <div className="AC_price">Rs. {fish.PricePerCouple}</div>

          <div className="AC_qty">
            <label className="AC_label">Quantity</label>
            <div className="AC_stepper">
              <button type="button" className="AC_step" onClick={() => handleQtyChange(Number(qty) - 1)} disabled={busy}>−</button>
              <input type="number" min="1" max={fish.Quantity || 99} value={qty} onChange={(e) => handleQtyChange(Number(e.target.value))} disabled={busy} />
              <button type="button" className="AC_step" onClick={() => handleQtyChange(Number(qty) + 1)} disabled={busy}>+</button>
            </div>
            <div className="AC_stockNote">
              In stock: {fish.Quantity ?? 0} {qtyAlreadyInCart() > 0 && <>| In your cart: {qtyAlreadyInCart()}</>}
            </div>
          </div>

          <div className="AC_actions">
            <button className="AC_btn outline" onClick={addToCartHandler} disabled={busy}>
              {busy ? "Adding..." : "Add to cart"}
            </button>
            <button className="AC_btn primary" onClick={buyNow} disabled={busy}>
              {busy ? "Processing..." : "Buy now"}
            </button>
          </div>

          <div className="AC_details">
            <div className="AC_kv"><div><strong>Stage</strong></div><div>{fish.Stage}</div></div>
            <div className="AC_kv"><div><strong>Tank No</strong></div><div>{fish.TankNumber}</div></div>
            <div className="AC_kv"><div><strong>Average Weight</strong></div><div>{fish.AverageWeight} g</div></div>
            <div className="AC_kv"><div><strong>Date of Arrival</strong></div><div>{fish.DateOfArrival ? new Date(fish.DateOfArrival).toDateString() : "-"}</div></div>
          </div>

          <div className="AC_accordions AC_accordionsRight">
            <details className="ac-item"><summary><span className="ac-left"><span className="ac-icon">💧</span><span className="ac-label">Type of water</span></span><span className="ac-chevron">⌄</span></summary><div className="ac-body">{waterText}</div></details>
            <details className="ac-item"><summary><span className="ac-left"><span className="ac-icon">🚚</span><span className="ac-label">Shipping & Returns</span></span><span className="ac-chevron">⌄</span></summary><div className="ac-body">{shippingText}</div></details>
            <details className="ac-item"><summary><span className="ac-left"><span className="ac-icon">❤️</span><span className="ac-label">Care Instructions</span></span><span className="ac-chevron">⌄</span></summary><div className="ac-body">{careText}</div></details>
          </div>
        </div>
      </div>

      <div className="AC_infoBlock">
        <h2 className="AC_infoTitle">General info about {fish.subSpecies}</h2>
        {fish.aboutFish ? <p className="AC_infoText">{fish.aboutFish}</p> : <p className="AC_infoText">No additional description available.</p>}
      </div>
    </>
  );
}