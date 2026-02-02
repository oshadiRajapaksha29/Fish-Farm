import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../Orders/Cart/CartContext";
import "./ProductDetails.css";

const API = "http://localhost:5000/foodAndMedicine";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [inStock, setInStock] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [popup, setPopup] = useState({ open: false, msg: "", type: "success" });

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await axios.get(`${API}/${id}`);
        setProduct(res.data.foodAndMedicine);
        setSelectedImage(res.data.foodAndMedicine.image);
        setInStock(res.data.foodAndMedicine.stock > 0);
      } catch (err) {
        console.error(err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setPopup({
      open: true,
      msg: `${product.name || 'Product'} added to cart successfully!`,
      type: 'success'
    });
  };

  // Buy Now function removed as requested

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) return (
    <div className="r_p_d_loading">
      Loading product information...
    </div>
  );
  
  if (!product) return (
    <div className="r_p_d_notFound">
      Product not found. The requested product may not exist or has been removed.
    </div>
  );

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
      <div className="r_p_d_container">
        {/* Image Section */}
        <div className="r_p_d_media">
          <div className="r_p_d_imgBox">
            {product.image ? (
              <img
                src={`http://localhost:5000/uploads/${selectedImage || product.image}`}
                alt={product.productName}
                className="r_p_d_img"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <div className="r_p_d_noImg">No Image Available</div>
            )}
          </div>

          {/* Thumbnails - Add this to match the fish product design */}
          <div className="r_p_d_thumbnails">
            {/* Primary image as first thumbnail */}
            {product.image && (
              <img 
                src={`http://localhost:5000/uploads/${product.image}`}
                className={`r_p_d_thumbnail ${selectedImage === product.image ? 'active' : ''}`}
                alt={`${product.productName} - Main`}
                onClick={() => setSelectedImage(product.image)}
              />
            )}
            
            {/* You can add more thumbnails if available in the future */}
            {/* For now showing placeholder thumbnails */}
            {product.category === "Food" && (
              <>
                <img 
                  src="/images/food-sample.jpg" 
                  className={`r_p_d_thumbnail ${selectedImage === 'food-sample.jpg' ? 'active' : ''}`}
                  alt="Product Image"
                  onClick={() => setSelectedImage(product.image)}
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="r_p_d_info">
          <h2 className="r_p_d_name">{product.productName}</h2>
          <div className="r_p_d_category">
            {product.category} • {product.size}
          </div>
          <div className="r_p_d_price">Rs. {product.price.toLocaleString()}</div>
          
          {/* Product Details */}
          <div className="r_p_d_details">
            <div className="r_p_d_detail_item">
              <span className="r_p_d_detail_label">Category</span>
              <span className="r_p_d_detail_value">{product.category}</span>
            </div>
            <div className="r_p_d_detail_item">
              <span className="r_p_d_detail_label">Size/Weight</span>
              <span className="r_p_d_detail_value">{product.size || 'Standard'}</span>
            </div>
            <div className="r_p_d_detail_item">
              <span className="r_p_d_detail_label">Stock Status</span>
              <span className="r_p_d_detail_value">
                {product.stock > 10 ? 'In Stock' : 
                  product.stock > 0 ? `Low Stock (${product.stock} left)` : 'Out of Stock'}
              </span>
            </div>
            <div className="r_p_d_detail_item">
              <span className="r_p_d_detail_label">In Stock</span>
              <span className="r_p_d_detail_value">{product.stock}</span>
            </div>
          </div>

          {inStock && (
            <div className="r_p_d_qty">
              <label htmlFor="quantity">Quantity:</label>
              <div className="r_p_d_qty_stepper">
                <button 
                  className="r_p_d_qty_btn" 
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >-</button>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, Number(e.target.value))))}
                />
                <button 
                  className="r_p_d_qty_btn" 
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                >+</button>
              </div>
              <div className="r_p_d_stock">
                {product.stock > 10 
                  ? 'In stock and ready to ship' 
                  : `Only ${product.stock} left in stock - order soon`}
              </div>
            </div>
          )}

          <div className="r_p_d_actions">
            {inStock ? (
              <>
                <button onClick={handleAddToCart} className="r_p_d_btn primary">
                  Add to Cart
                </button>
              </>
            ) : (
              <button disabled className="r_p_d_btn primary" style={{opacity: 0.6, cursor: 'not-allowed'}}>
                Out of Stock
              </button>
            )}
          </div>

          {/* Additional Information Accordion */}
          <div className="r_p_d_accordion">
            <div className={`r_p_d_accordion_item ${activeAccordion === 0 ? 'active' : ''}`}>
              <div className="r_p_d_accordion_header" onClick={() => toggleAccordion(0)}>
                <div className="r_p_d_accordion_left">
                  <span className="r_p_d_accordion_icon">📦</span>
                  <span className="r_p_d_accordion_title">Shipping Information</span>
                </div>
                <span className="r_p_d_accordion_chevron">▼</span>
              </div>
              <div className="r_p_d_accordion_content">
                <p>We ship throughout Sri Lanka. Standard delivery takes 3-5 business days. 
                Express delivery is available for an additional fee and typically arrives within 1-2 business days.</p>
              </div>
            </div>

            <div className={`r_p_d_accordion_item ${activeAccordion === 1 ? 'active' : ''}`}>
              <div className="r_p_d_accordion_header" onClick={() => toggleAccordion(1)}>
                <div className="r_p_d_accordion_left">
                  <span className="r_p_d_accordion_icon">↩️</span>
                  <span className="r_p_d_accordion_title">Returns & Refunds</span>
                </div>
                <span className="r_p_d_accordion_chevron">▼</span>
              </div>
              <div className="r_p_d_accordion_content">
                <p>If you're not completely satisfied with your purchase, you can return it within 
                7 days for a full refund. Products must be in original condition and packaging.</p>
              </div>
            </div>

            <div className={`r_p_d_accordion_item ${activeAccordion === 2 ? 'active' : ''}`}>
              <div className="r_p_d_accordion_header" onClick={() => toggleAccordion(2)}>
                <div className="r_p_d_accordion_left">
                  <span className="r_p_d_accordion_icon">📝</span>
                  <span className="r_p_d_accordion_title">Usage Instructions</span>
                </div>
                <span className="r_p_d_accordion_chevron">▼</span>
              </div>
              <div className="r_p_d_accordion_content">
                <p>Please refer to the product packaging for detailed usage instructions. 
                For food products, follow the feeding guidelines based on fish size and species. 
                For medicines, carefully follow the dosage instructions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description Block */}
      {product.description && (
        <div className="r_p_d_desc_block">
          <h3 className="r_p_d_desc_title">About this product</h3>
          <div className="r_p_d_desc">{product.description}</div>
        </div>
      )}
    </>
  );
}