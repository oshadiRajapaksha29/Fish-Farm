// src/pages/Orders/Checkout.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "./CartContext";
import { useNavigate, useParams } from "react-router-dom";
import { saveUserContact } from "../../../utils/userUtils";
import "./Checkout.css";

const ORDERS_API = "http://localhost:5000/orderDetails";

export default function Checkout() {
  const { items, totals, clear } = useCart();
  const nav = useNavigate();
  const { id } = useParams();

  const [contact, setContact] = useState({ emailOrPhone: "" });
  const [delivery, setDelivery] = useState({
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pinCode: "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [bankSlip, setBankSlip] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [errors, setErrors] = useState({
    contact: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    phone: "",
    bankSlip: ""
  });
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (id) {
      const fetchOrder = async () => {
        try {
          const res = await axios.get(`${ORDERS_API}/${id}`);
          const order = res.data;
          if (order) {
            setContact(order.contact || { emailOrPhone: "" });
            setDelivery(order.delivery || {});
            setPaymentMethod(order.payment?.method || "COD");
          }
        } catch (err) {
          console.error("Failed to fetch order", err);
        }
      };
      fetchOrder();
    }
  }, [id]);

  if (!id && items.length === 0) {
    return (
      <div className="r_ch_o_empty">
        <h2>Checkout</h2>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    
    if (!contact.emailOrPhone) {
      newErrors.contact = "Email or phone is required";
      isValid = false;
    } else if (contact.emailOrPhone.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact.emailOrPhone)) {
        newErrors.contact = "Please enter a valid email address";
        isValid = false;
      }
    } else {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(contact.emailOrPhone.replace(/[\s-()]/g, ''))) {
        newErrors.contact = "Please enter a valid 10-digit phone number";
        isValid = false;
      }
    }
    
    if (!delivery.firstName) {
      newErrors.firstName = "First name is required";
      isValid = false;
    }
    
    if (!delivery.lastName) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    }
    
    if (!delivery.address) {
      newErrors.address = "Address is required";
      isValid = false;
    } else if (delivery.address.length < 5) {
      newErrors.address = "Please enter a complete address";
      isValid = false;
    }
    
    if (!delivery.city) {
      newErrors.city = "City is required";
      isValid = false;
    }
    
    if (!delivery.state) {
      newErrors.state = "State is required";
      isValid = false;
    }
    
    if (!delivery.pinCode) {
      newErrors.pinCode = "Pin code is required";
      isValid = false;
    } else if (!/^\d{6}$/.test(delivery.pinCode)) {
      newErrors.pinCode = "Please enter a valid 6-digit pin code";
      isValid = false;
    }
    
    if (!delivery.phone) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(delivery.phone.replace(/[\s-()]/g, ''))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
      isValid = false;
    }
    
    if (paymentMethod === "BANK_SLIP" && !bankSlip && !id) {
      newErrors.bankSlip = "Please upload a bank slip image";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateForm();
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const allFields = [
      'contact', 'firstName', 'lastName', 'address', 
      'city', 'state', 'pinCode', 'phone', 'bankSlip'
    ];
    const allTouched = allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
    setTouched(allTouched);
    
    if (!validateForm()) {
      const form = document.querySelector('.r_ch_o_form');
      form.classList.add('animate-shake');
      setTimeout(() => form.classList.remove('animate-shake'), 500);
      
      const firstErrorField = document.querySelector('.input-error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
      return;
    }
    
    setLoading(true);

    try {
      if (items.length === 0 && !id) {
        throw new Error("Your cart is empty, please add items before checkout");
      }

      const payloadItems = items.map((it) => {
        let productType = "Food&MedicineModel";
        
        if (it.fishType || it.Species || it.subSpecies || it.category === "Fish") {
          productType = "Fish";
        } else if (it.accessoryType || it.category === "Accessory") {
          productType = "Accessory";
        }
        
        let price = it.price;
        if (productType === "Fish" && it.PricePerCouple !== undefined && (it.price === undefined || isNaN(it.price))) {
          price = it.PricePerCouple;
        }
        
        price = Number(price) || 0;
        
        return {
          product: it._id,
          productType: productType,
          quantity: it.qty,
          price: price,
        };
      });

      const fd = new FormData();
      fd.append("items", JSON.stringify(payloadItems));
      fd.append("contact", JSON.stringify(contact));
      fd.append("delivery", JSON.stringify(delivery));
      fd.append("payment", JSON.stringify({ method: paymentMethod }));
      
      if (paymentMethod === "BANK_SLIP") {
        if (!bankSlip && !id) {
          throw new Error("Please upload a bank slip image");
        }
        if (bankSlip) {
          fd.append("bankSlipImage", bankSlip);
        }
      }

      let res;
      if (id) {
        res = await axios.put(`${ORDERS_API}/${id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.post(ORDERS_API, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        
        if (contact?.emailOrPhone) {
          saveUserContact(contact.emailOrPhone);
        }
        
        clear();
      }

      const newId = res.data?.order?._id || id;
      nav(newId ? `/order-success/${newId}` : "/order-success/thank-you");
    } catch (err) {
      console.error("Order submission error:", err);
      
      if (err.response) {
        alert(err.response.data?.message || "Server error: " + err.response.status);
      } else if (err.request) {
        alert("No response from server. Please check your internet connection.");
      } else {
        alert(err.message || "Failed to process order");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="r_ch_o_container">
      <div className="r_ch_o_header">
        <div className="r_ch_o_header_icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2>{id ? "Update Order" : "Secure Checkout"}</h2>
        <p className="r_ch_o_header_subtitle">Complete your purchase securely</p>
      </div>

      <div className="r_ch_o_content_wrapper">
        <form onSubmit={handleSubmit} className="r_ch_o_form">
          {!id && (
            <div className="r_ch_o_total_card">
              <div className="r_ch_o_total_icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM9 19C9 20.1046 8.10457 21 7 21C5.89543 21 5 20.1046 5 19C5 17.8954 5.89543 17 7 17C8.10457 17 9 17.8954 9 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="r_ch_o_total_content">
                <span className="r_ch_o_total_label">Order Total</span>
                <span className="r_ch_o_total_amount">Rs. {totals.subtotal.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Contact Section */}
          <div className="r_ch_o_section">
            <div className="r_ch_o_section_header">
              <div className="r_ch_o_section_icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3>Contact Information</h3>
                <p>We'll use this to send your order confirmation</p>
              </div>
            </div>
            <div className="r_ch_o_field">
              <label>Email or Phone Number</label>
              <input
                type="text"
                placeholder="example@email.com or +94 712345678"
                value={contact.emailOrPhone}
                onChange={(e) => setContact({ emailOrPhone: e.target.value })}
                onBlur={() => handleBlur('contact')}
                className={`r_ch_o_input ${errors.contact && touched.contact ? 'input-error' : ''}`}
              />
              {errors.contact && touched.contact && <div className="error-message">{errors.contact}</div>}
            </div>
          </div>

          {/* Delivery Section */}
          <div className="r_ch_o_section">
            <div className="r_ch_o_section_header">
              <div className="r_ch_o_section_icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.657 16.657L13.414 20.9C13.039 21.275 12.535 21.487 12.007 21.487C11.479 21.487 10.975 21.275 10.6 20.9L6.343 16.657C5.22422 15.5381 4.46234 14.1127 4.15369 12.5608C3.84504 11.009 4.00349 9.40047 4.60901 7.93853C5.21452 6.4766 6.2399 5.22726 7.55548 4.34824C8.87107 3.46921 10.4178 3 12 3C13.5822 3 15.1289 3.46921 16.4445 4.34824C17.7601 5.22726 18.7855 6.4766 19.391 7.93853C19.9965 9.40047 20.155 11.009 19.8463 12.5608C19.5377 14.1127 18.7758 15.5381 17.657 16.657V16.657Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3>Delivery Address</h3>
                <p>Where should we deliver your order?</p>
              </div>
            </div>
            
            <div className="r_ch_o_row">
              <div className="r_ch_o_field">
                <label>First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  value={delivery.firstName}
                  onChange={(e) => setDelivery({ ...delivery, firstName: e.target.value })}
                  onBlur={() => handleBlur('firstName')}
                  className={`r_ch_o_input ${errors.firstName && touched.firstName ? 'input-error' : ''}`}
                />
                {errors.firstName && touched.firstName && <div className="error-message">{errors.firstName}</div>}
              </div>
              <div className="r_ch_o_field">
                <label>Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={delivery.lastName}
                  onChange={(e) => setDelivery({ ...delivery, lastName: e.target.value })}
                  onBlur={() => handleBlur('lastName')}
                  className={`r_ch_o_input ${errors.lastName && touched.lastName ? 'input-error' : ''}`}
                />
                {errors.lastName && touched.lastName && <div className="error-message">{errors.lastName}</div>}
              </div>
            </div>

            <div className="r_ch_o_field">
              <label>Street Address</label>
              <input
                type="text"
                placeholder="123 Main Street"
                value={delivery.address}
                onChange={(e) => setDelivery({ ...delivery, address: e.target.value })}
                onBlur={() => handleBlur('address')}
                className={`r_ch_o_input ${errors.address && touched.address ? 'input-error' : ''}`}
              />
              {errors.address && touched.address && <div className="error-message">{errors.address}</div>}
            </div>

            <div className="r_ch_o_field">
              <label>Apartment, Suite, etc. (Optional)</label>
              <input
                type="text"
                placeholder="Apt 4B"
                value={delivery.apartment}
                onChange={(e) => setDelivery({ ...delivery, apartment: e.target.value })}
                className="r_ch_o_input"
              />
            </div>

            <div className="r_ch_o_field">
              <label>City</label>
              <input
                type="text"
                placeholder="Colombo"
                value={delivery.city}
                onChange={(e) => setDelivery({ ...delivery, city: e.target.value })}
                onBlur={() => handleBlur('city')}
                className={`r_ch_o_input ${errors.city && touched.city ? 'input-error' : ''}`}
              />
              {errors.city && touched.city && <div className="error-message">{errors.city}</div>}
            </div>

            <div className="r_ch_o_row">
              <div className="r_ch_o_field">
                <label>State / Province</label>
                <input
                  type="text"
                  placeholder="Western Province"
                  value={delivery.state}
                  onChange={(e) => setDelivery({ ...delivery, state: e.target.value })}
                  onBlur={() => handleBlur('state')}
                  className={`r_ch_o_input ${errors.state && touched.state ? 'input-error' : ''}`}
                />
                {errors.state && touched.state && <div className="error-message">{errors.state}</div>}
              </div>
              <div className="r_ch_o_field">
                <label>Postal Code</label>
                <input
                  type="text"
                  placeholder="10400"
                  value={delivery.pinCode}
                  onChange={(e) => setDelivery({ ...delivery, pinCode: e.target.value })}
                  onBlur={() => handleBlur('pinCode')}
                  className={`r_ch_o_input ${errors.pinCode && touched.pinCode ? 'input-error' : ''}`}
                />
                {errors.pinCode && touched.pinCode && <div className="error-message">{errors.pinCode}</div>}
              </div>
            </div>

            <div className="r_ch_o_field">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="+94 712345678"
                value={delivery.phone}
                onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })}
                onBlur={() => handleBlur('phone')}
                className={`r_ch_o_input ${errors.phone && touched.phone ? 'input-error' : ''}`}
              />
              {errors.phone && touched.phone && <div className="error-message">{errors.phone}</div>}
            </div>
          </div>

          {/* Payment Section */}
          <div className="r_ch_o_section">
            <div className="r_ch_o_section_header">
              <div className="r_ch_o_section_icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 10H21M7 15H8M12 15H13M6 19H18C18.5304 19 19.0391 18.7893 19.4142 18.4142C19.7893 18.0391 20 17.5304 20 17V7C20 6.46957 19.7893 5.96086 19.4142 5.58579C19.0391 5.21071 18.5304 5 18 5H6C5.46957 5 4.96086 5.21071 4.58579 5.58579C4.21071 5.96086 4 6.46957 4 7V17C4 17.5304 4.21071 18.0391 4.58579 18.4142C4.96086 18.7893 5.46957 19 6 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3>Payment Method</h3>
                <p>Choose your preferred payment option</p>
              </div>
            </div>

            <div className="r_ch_o_payment_options">
              <label className={`r_ch_o_payment_card ${paymentMethod === "COD" ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="pay"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                />
                <div className="r_ch_o_payment_content">
                  <div className="r_ch_o_payment_icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13.41 18.09V19.5C13.41 20.05 12.96 20.5 12.41 20.5H11.59C11.04 20.5 10.59 20.05 10.59 19.5V18.07C9.16 17.78 8 16.67 8 15.23C8 14.68 8.45 14.23 9 14.23C9.55 14.23 10 14.68 10 15.23C10 15.94 10.47 16.5 11.5 16.5H12.5C13.33 16.5 14 15.83 14 15C14 14.17 13.33 13.5 12.5 13.5H11.5C9.84 13.5 8.5 12.16 8.5 10.5C8.5 9.03 9.64 7.83 11.09 7.54V6C11.09 5.45 11.54 5 12.09 5H12.91C13.46 5 13.91 5.45 13.91 6V7.54C15.36 7.83 16.5 9.03 16.5 10.5C16.5 11.05 16.05 11.5 15.5 11.5C14.95 11.5 14.5 11.05 14.5 10.5C14.5 9.67 13.83 9 13 9H11C10.17 9 9.5 9.67 9.5 10.5C9.5 11.33 10.17 12 11 12H13C14.66 12 16 13.34 16 15C16 16.47 14.86 17.67 13.41 18.09Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="r_ch_o_payment_info">
                    <span className="r_ch_o_payment_title">Cash on Delivery</span>
                    <span className="r_ch_o_payment_desc">Pay when you receive your order</span>
                  </div>
                </div>
                <div className="r_ch_o_payment_check">
                  {paymentMethod === "COD" && (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </label>

              <label className={`r_ch_o_payment_card ${paymentMethod === "BANK_SLIP" ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="pay"
                  value="BANK_SLIP"
                  checked={paymentMethod === "BANK_SLIP"}
                  onChange={() => setPaymentMethod("BANK_SLIP")}
                />
                <div className="r_ch_o_payment_content">
                  <div className="r_ch_o_payment_icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="r_ch_o_payment_info">
                    <span className="r_ch_o_payment_title">Bank Transfer</span>
                    <span className="r_ch_o_payment_desc">Transfer to our bank account</span>
                  </div>
                </div>
                <div className="r_ch_o_payment_check">
                  {paymentMethod === "BANK_SLIP" && (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </label>
            </div>

            {paymentMethod === "BANK_SLIP" && (
              <div className="r_ch_o_bank_section">
                <div className="r_ch_o_bank_details">
                  <div className="r_ch_o_bank_header">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h4>Bank Account Details</h4>
                  </div>
                  <div className="r_ch_o_bank_info">
                    <div className="r_ch_o_bank_row">
                      <span className="r_ch_o_bank_label">Bank Name</span>
                      <span className="r_ch_o_bank_value">Bank of Ceylon</span>
                    </div>
                    <div className="r_ch_o_bank_row">
                      <span className="r_ch_o_bank_label">Account Name</span>
                      <span className="r_ch_o_bank_value">Aqua Peak Fish Farm (Pvt) Ltd</span>
                    </div>
                    <div className="r_ch_o_bank_row highlight">
                      <span className="r_ch_o_bank_label">Account Number</span>
                      <span className="r_ch_o_bank_value">1234567890</span>
                    </div>
                    <div className="r_ch_o_bank_row">
                      <span className="r_ch_o_bank_label">Branch</span>
                      <span className="r_ch_o_bank_value">Galle Main Branch</span>
                    </div>
                    <div className="r_ch_o_bank_row">
                      <span className="r_ch_o_bank_label">SWIFT Code</span>
                      <span className="r_ch_o_bank_value">BCEYLKLX</span>
                    </div>
                  </div>
                  <div className="r_ch_o_bank_note">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <p>Make the payment to the above account and upload the deposit slip below. Include your name and order reference in the remarks.</p>
                  </div>
                </div>

                <div className="r_ch_o_upload_section">
                  <label className="r_ch_o_upload_label" htmlFor="bankSlipUpload">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Upload Bank Deposit Slip <span className="required">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setBankSlip(file);
                      if (file) {
                        setErrors({...errors, bankSlip: ""});
                      }
                    }}
                    onBlur={() => handleBlur('bankSlip')}
                    className={`r_ch_o_file_input ${errors.bankSlip && touched.bankSlip ? 'input-error' : ''}`}
                    id="bankSlipUpload"
                  />
                  {bankSlip && (
                    <div className="r_ch_o_file_preview">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>{bankSlip.name} ({(bankSlip.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  )}
                  {errors.bankSlip && touched.bankSlip && <div className="error-message">{errors.bankSlip}</div>}
                  <p className="r_ch_o_upload_hint">Accepted formats: JPG, PNG, GIF (Max: 10MB)</p>
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="r_ch_o_submit_btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{loading ? (id ? "Updating..." : "Placing Order...") : id ? "Update Order" : "Place Order"}</span>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>

        <div className="r_ch_o_sidebar">
          <div className="r_ch_o_trust_card">
            <h4>Why Shop With Us?</h4>
            <div className="r_ch_o_trust_item">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <strong>Secure Payment</strong>
                <p>Your payment information is protected</p>
              </div>
            </div>
            <div className="r_ch_o_trust_item">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 16H12V12H11M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <strong>Fast Delivery</strong>
                <p>Quick and reliable shipping</p>
              </div>
            </div>
            <div className="r_ch_o_trust_item">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <strong>Quality Guarantee</strong>
                <p>Premium quality products</p>
              </div>
            </div>
          </div>

          <div className="r_ch_o_help_card">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h4>Need Help?</h4>
            <p>Our customer support team is here to assist you</p>
            <a href="/contact" className="r_ch_o_help_link">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
