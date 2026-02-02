import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import axios from 'axios';
import './RelatedProducts.css';

const RelatedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        // Get random products from the Food & Medicine category
        const response = await axios.get('http://localhost:5000/foodMedicine?limit=3');
        if (response.data && response.data.length) {
          setProducts(response.data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch related products:', err);
        setLoading(false);
      }
    };
    
    fetchRelatedProducts();
  }, []);
  
  const API_BASE = (process.env.REACT_APP_API_BASE || "http://localhost:5000").replace(/\/$/, "");
  
  // Resolve image paths
  const resolveImageSrc = (img) => {
    if (!img) return null;
    if (typeof img !== "string") return null;
    let s = img.replace(/\\/g, "/");
    if (s.startsWith("http")) return s;
    const clean = s.replace(/^\/+/, "");
    if (clean.includes("/")) {
      return `${API_BASE}/${clean}`;
    }
    return `${API_BASE}/uploads/${clean}`;
  };
  
  if (loading) {
    return <div className="r_related_loading">Loading suggestions...</div>;
  }
  
  if (products.length === 0) {
    return null;
  }
  
  return (
    <div className="r_related_container">
      <h3 className="r_related_title">You Might Also Like</h3>
      
      <div className="r_related_products">
        {products.map(product => (
          <div key={product._id} className="r_related_product">
            {product.image && (
              <div 
                className="r_related_image" 
                onClick={() => navigate(`/shop/food-medicine/${product._id}`)}
              >
                <img 
                  src={resolveImageSrc(product.image)} 
                  alt={product.productName || product.name} 
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}
            
            <div className="r_related_info">
              <div 
                className="r_related_name"
                onClick={() => navigate(`/shop/food-medicine/${product._id}`)}
              >
                {product.productName || product.name}
              </div>
              
              <div className="r_related_price">
                Rs. {product.price}
              </div>
              
              <button 
                className="r_related_add_btn"
                onClick={() => addItem(product, 1)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;