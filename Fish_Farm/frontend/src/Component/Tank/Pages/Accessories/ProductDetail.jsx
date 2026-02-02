import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../../Orders/Cart/CartContext";
import "./ProductDetail.css";

const API_BASE = (process.env.REACT_APP_API_BASE || "http://localhost:5000").replace(/\/$/, "");
const toImageUrl = (p) => {
  if (!p) return "";
  if (p.startsWith("http")) return p;
  // Handle different image path formats
  if (p.startsWith("/")) return `${API_BASE}${p}`;
  return `${API_BASE}/${p}`;
};

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const { addItem, items } = useCart();
  const navigate = useNavigate();
  const [popup, setPopup] = useState({ open: false, msg: "", type: "success" });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Magnifier state
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
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get(`http://localhost:5000/accessories/${id}`);
        console.log("API Response:", response.data); // Debug log
        
        const productData = response.data.accessory || response.data;
        setProduct(productData);
        
        // Set main image - try different possible image fields
        const imagePath = productData.imageProduct || productData.image || productData.photo;
        if (imagePath) {
          const fullImageUrl = toImageUrl(imagePath);
          console.log("Setting main image:", fullImageUrl); // Debug log
          setMainImage(fullImageUrl);
        } else {
          console.log("No image path found in product data");
          setMainImage("");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <h2 style={{ textAlign: "center", padding: "2rem" }}>Loading product details...</h2>;
  if (error) return <div className="AC_container"><p className="error">{error}</p></div>;
  if (!product) return <h2 style={{ textAlign: "center" }}>Product not found</h2>;

  console.log("Current product state:", product); // Debug log
  console.log("Current mainImage:", mainImage); // Debug log

  // Get all gallery images
  const galleryImages = [
    product.imageProduct || product.image || product.photo,
    ...(product.buyerImagesProduct || product.additionalImages || [])
  ].filter(Boolean).map(toImageUrl);

  console.log("Gallery images:", galleryImages); // Debug log

  const qtyAlreadyInCart = () => {
    const existing = items.find((item) => item._id === product._id);
    return existing?.qty || 0;
  };

  const validateStock = (requested) => {
    const stock = product.stock || product.Quantity || 0;
    const inCart = qtyAlreadyInCart();
    const allowed = Math.max(0, stock - inCart);

    if (requested < 1) {
      setPopup({ open: true, msg: "Minimum quantity is 1.", type: "error" });
      return false;
    }
    if (requested > allowed) {
      const msg =
        allowed > 0
          ? `Only ${allowed} left in stock for ${product.product || product.productName}. You already have ${inCart} in your cart, and requested ${requested}.`
          : `Sorry, ${product.product || product.productName} is already at your cart limit. No more stock available.`;
      setPopup({ open: true, msg, type: "error" });
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    const intQty = parseInt(quantity || 1, 10);
    if (!validateStock(intQty)) return;

    setBusy(true);
    
    // Extract just filename from imageProduct
    const imagePath = product.imageProduct || product.image || product.photo || "";
    const parts = imagePath.split("/");
    const imageFile = parts[parts.length - 1] || imagePath;

    const cartItem = {
      _id: product._id,
      productName: product.product || product.productName,
      image: imageFile,
      price: product.specialPrice || product.price,
      stock: product.stock || product.Quantity,
      category: product.category,
    };
    
    addItem(cartItem, intQty);
    setPopup({
      open: true,
      msg: `${product.product || product.productName || 'Product'} added to cart successfully!`,
      type: 'success'
    });
    setBusy(false);
  };

  const buyNow = () => {
    const intQty = parseInt(quantity || 1, 10);
    if (!validateStock(intQty)) return;

    setBusy(true);
    
    // Extract just filename from imageProduct
    const imagePath = product.imageProduct || product.image || product.photo || "";
    const parts = imagePath.split("/");
    const imageFile = parts[parts.length - 1] || imagePath;

    const cartItem = {
      _id: product._id,
      productName: product.product || product.productName,
      image: imageFile,
      price: product.specialPrice || product.price,
      stock: product.stock || product.Quantity,
      category: product.category,
    };
    
    addItem(cartItem, intQty);
    navigate("/cart");
    setBusy(false);
  };

  const handleQtyChange = (next) => {
    const stock = product.stock || product.Quantity || 0;
    const inCart = qtyAlreadyInCart();
    const allowed = Math.max(0, stock - inCart);

    if (next < 1) {
      setQuantity(1);
      setPopup({ open: true, msg: "Minimum quantity is 1.", type: "error" });
      return;
    }
    if (next > allowed) {
      setQuantity(allowed > 0 ? allowed : 1);
      const msg =
        allowed > 0
          ? `Only ${allowed} left in stock for ${product.product || product.productName}.`
          : `No more stock available for ${product.product || product.productName}.`;
      setPopup({ open: true, msg, type: "error" });
      return;
    }
    setQuantity(next);
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

  const shippingText = `Prepaid: 2-3 days. COD: 3-5 days. Ready stock: 24-48hrs.`;

  const careText = `Handle with care. Follow manufacturer instructions for best results.`;

  const warrantyText = `1 year manufacturer warranty. Contact support for claims.`;

  return (
    <>
      {/* Popup Modal */}
      {popup.open && (
        <div className="ac-pop">
          <div className="ac-pop__backdrop" onClick={() => setPopup({ open: false, msg: "", type: popup.type })} />
          <div 
            className="ac-pop__box" 
            role="alertdialog" 
            aria-live="assertive"
            data-type={popup.type}
          >
            <div className="ac-pop__title">
              {popup.type === 'success' ? 'Success' : 'Error'}
            </div>
            <div className="ac-pop__msg">{popup.msg}</div>
            <button className="ac-pop__btn" onClick={() => setPopup({ open: false, msg: "", type: popup.type })}>
              Okay
            </button>
          </div>
        </div>
      )}
      
      <div className="AC_container">
        {/* Left: Media Section */}
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
                <img 
                  className="AC_mainImage" 
                  src={mainImage} 
                  alt={product.product || product.productName} 
                  draggable="false"
                  onError={(e) => {
                    console.error("Image failed to load:", mainImage);
                    e.target.style.display = 'none';
                  }}
                />
                {lensVisible && <div className="magnifier-lens" style={lensStyle} aria-hidden="true" />}
              </div>
            ) : (
              <div className="AC_fallback" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                color: '#64748b',
                fontSize: '18px'
              }}>
                No image available
              </div>
            )}
          </div>
          
          {galleryImages.length > 0 && galleryImages[0] && (
            <div className="AC_gallery">
              {galleryImages.map((src, i) => (
                <button 
                  key={i} 
                  type="button" 
                  className={`AC_thumb ${src === mainImage ? "is-active" : ""}`} 
                  onClick={() => setMainImage(src)}
                >
                  <img 
                    src={src} 
                    alt={`thumb-${i}`} 
                    onError={(e) => {
                      console.error("Thumbnail failed to load:", src);
                      e.target.style.display = 'none';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="AC_info">
          <h1 className="AC_name">{product.product || product.productName}</h1>
          <div className="AC_category AC_muted">Category: {product.category}</div>

          <div className="AC_price">
            {product.specialPrice ? (
              <>
                <span className="AC_old">Rs. {product.price}</span>
                <span className="AC_new"> Rs. {product.specialPrice}</span>
              </>
            ) : (
              <span>Rs. {product.price}</span>
            )}
          </div>

          {/* Quantity */}
          <div className="AC_qty">
            <label className="AC_label">Quantity</label>
            <div className="AC_stepper">
              <button 
                type="button" 
                className="AC_step" 
                onClick={() => handleQtyChange(Number(quantity) - 1)} 
                disabled={busy}
              >−</button>
              <input 
                type="number" 
                min="1" 
                max={product.stock || product.Quantity || 99} 
                value={quantity} 
                onChange={(e) => handleQtyChange(Number(e.target.value))} 
                disabled={busy} 
              />
              <button 
                type="button" 
                className="AC_step" 
                onClick={() => handleQtyChange(Number(quantity) + 1)} 
                disabled={busy}
              >+</button>
            </div>
            <div className="AC_stockNote">
              In stock: {product.stock || product.Quantity || 0} 
              {qtyAlreadyInCart() > 0 && <> | In your cart: {qtyAlreadyInCart()}</>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="AC_actions">
            <button className="AC_btn outline" onClick={handleAddToCart} disabled={busy}>
              {busy ? "Adding..." : "Add to cart"}
            </button>
            <button className="AC_btn primary" onClick={buyNow} disabled={busy}>
              {busy ? "Processing..." : "Buy now"}
            </button>
          </div>

          {/* Product Details */}
          <div className="AC_details">
            <div className="AC_kv">
              <div><strong>Weight</strong></div>
              <div>{product.weight || product.Weight || "N/A"} kg</div>
            </div>
            <div className="AC_kv">
              <div><strong>Dimensions</strong></div>
              <div>
                {product.length || product.Length || "N/A"} × 
                {product.width || product.Width || "N/A"} × 
                {product.height || product.Height || "N/A"} cm
              </div>
            </div>
          </div>

          {/* Accordions */}
          <div className="AC_accordions AC_accordionsRight">
            <details className="ac-item">
              <summary>
                <span className="ac-left">
                  <span className="ac-icon">🚚</span>
                  <span className="ac-label">Shipping & Returns</span>
                </span>
                <span className="ac-chevron">⌄</span>
              </summary>
              <div className="ac-body">{shippingText}</div>
            </details>
            <details className="ac-item">
              <summary>
                <span className="ac-left">
                  <span className="ac-icon">🔧</span>
                  <span className="ac-label">Care Instructions</span>
                </span>
                <span className="ac-chevron">⌄</span>
              </summary>
              <div className="ac-body">{careText}</div>
            </details>
            <details className="ac-item">
              <summary>
                <span className="ac-left">
                  <span className="ac-icon">🛡️</span>
                  <span className="ac-label">Warranty</span>
                </span>
                <span className="ac-chevron">⌄</span>
              </summary>
              <div className="ac-body">{warrantyText}</div>
            </details>
          </div>
        </div>
      </div>

      {/* Description Block */}
      <div className="AC_infoBlock">
        <h2 className="AC_infoTitle">About {product.product || product.productName}</h2>
        <p className="AC_infoText">
          {product.description || "No additional description available."}
        </p>
      </div>
    </>
  );
};

export default ProductDetail;