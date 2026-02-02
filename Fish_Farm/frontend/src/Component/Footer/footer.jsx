import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaAngleRight } from 'react-icons/fa';
import './footer.css';
import logoImage from '../image/Logo.png'; // Update path as needed

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="g_f_footer">
      {/* Main Footer Content */}
      <div className="g_f_main_footer">
        <div className="g_f_container">
          <div className="g_f_footer_grid">
            {/* Company Info */}
            <div className="g_f_footer_column">
              <div className="g_f_footer_logo">
                <img src={logoImage} alt="Aqua Peak Logo" />
              </div>
              <p className="g_f_company_description">
                Aqua Peak is a premier fish farm offering high-quality ornamental fish, 
                aquarium supplies, and expert advice for fish enthusiasts.
              </p>
              <div className="g_f_social_icons">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <FaFacebook />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <FaTwitter />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <FaInstagram />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                  <FaLinkedin />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                  <FaYoutube />
                </a>
              </div>
            </div>

            {/* Useful Links */}
            <div className="g_f_footer_column">
              <h3 className="g_f_footer_heading">Useful Links</h3>
              <ul className="g_f_footer_links">
                <li><Link to="/"><FaAngleRight className="g_f_link_icon" /> Home</Link></li>
                <li><Link to="/about"><FaAngleRight className="g_f_link_icon" /> About Us</Link></li>
                <li><Link to="/services"><FaAngleRight className="g_f_link_icon" /> Services</Link></li>
                <li><Link to="/shop"><FaAngleRight className="g_f_link_icon" /> Shop</Link></li>
                <li><Link to="/blog"><FaAngleRight className="g_f_link_icon" /> Blog</Link></li>
                <li><Link to="/contact"><FaAngleRight className="g_f_link_icon" /> Contact Us</Link></li>
              </ul>
            </div>

            {/* Fish Categories */}
            <div className="g_f_footer_column">
              <h3 className="g_f_footer_heading">Fish Categories</h3>
              <ul className="g_f_footer_links">
                <li><Link to="/categories/freshwater"><FaAngleRight className="g_f_link_icon" /> Freshwater Fish</Link></li>
                <li><Link to="/categories/tropical"><FaAngleRight className="g_f_link_icon" /> Tropical Fish</Link></li>
                <li><Link to="/categories/cold-water"><FaAngleRight className="g_f_link_icon" /> Cold Water Fish</Link></li>
                <li><Link to="/categories/fancy"><FaAngleRight className="g_f_link_icon" /> Fancy Fish</Link></li>
                <li><Link to="/shop/food-medicine"><FaAngleRight className="g_f_link_icon" /> Fish Food & Medicine</Link></li>
                <li><Link to="/dashboard/homeaccessories"><FaAngleRight className="g_f_link_icon" /> Aquarium Accessories</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="g_f_footer_column">
              <h3 className="g_f_footer_heading">Contact Us</h3>
              <ul className="g_f_contact_list">
                <li>
                  <FaMapMarkerAlt className="g_f_contact_icon" />
                  <div>
                    <span>123 Fish Farm Road,</span>
                    <span>Colombo, Sri Lanka</span>
                  </div>
                </li>
                <li>
                  <FaPhone className="g_f_contact_icon" />
                  <div>
                    <span>+94 123 456 789</span>
                    <span>+94 987 654 321</span>
                  </div>
                </li>
                <li>
                  <FaEnvelope className="g_f_contact_icon" />
                  <span>info@aquapeak.com</span>
                </li>
                <li>
                  <FaClock className="g_f_contact_icon" />
                  <div>
                    <span>Monday - Friday: 9am - 5pm</span>
                    <span>Weekend: 10am - 3pm</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer - Copyright */}
      <div className="g_f_bottom_footer">
        <div className="g_f_container">
          <div className="g_f_copyright">
            <p>&copy; {currentYear} Aqua Peak Fish Farm. All Rights Reserved.</p>
          </div>
          <div className="g_f_footer_bottom_links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-conditions">Terms & Conditions</Link>
            <Link to="/sitemap">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
