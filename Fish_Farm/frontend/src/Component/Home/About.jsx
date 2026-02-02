import React from 'react';
import './About.css';
import { FaFish, FaLeaf, FaAward, FaUsers, FaHeart, FaShieldAlt } from 'react-icons/fa';

const About = () => {
  return (
    <div className="g_au_about-page">
      <div className="g_au_about-container">
        {/* Header Section */}
        <div className="g_au_about-header">
          <h1 className="g_au_about-title">About Aqua-Peak Fish Farm</h1>
          <p className="g_au_about-subtitle">
            Your Trusted Partner in Quality Fish Farming
          </p>
        </div>

        {/* Introduction Section */}
        <div className="g_au_about-intro">
          <div className="g_au_intro-content">
            <h2>Welcome to Aqua-Peak</h2>
            <p>
              We are dedicated to providing high-quality fish varieties with the best fish farming 
              management system. Our mission is to deliver premium fish to our customers while 
              maintaining sustainable and ethical fish farming practices.
            </p>
            <p>
              With years of experience in aquaculture, we have established ourselves as a leader 
              in the industry, combining traditional knowledge with modern technology to ensure 
              the highest standards of fish health and quality.
            </p>
          </div>
          <div className="g_au_intro-image">
            <div className="g_au_image-placeholder">
              <FaFish className="g_au_placeholder-icon" />
            </div>
          </div>
        </div>

        {/* Mission & Vision Section */}
        <div className="g_au_about-mission-vision">
          <div className="g_au_mission-card">
            <h3>Our Mission</h3>
            <p>
              To provide our customers with the finest quality fish while promoting sustainable 
              aquaculture practices that protect our environment and support local communities.
            </p>
          </div>
          <div className="g_au_vision-card">
            <h3>Our Vision</h3>
            <p>
              To be recognized as the leading fish farm, setting industry standards for quality, 
              sustainability, and innovation in aquaculture management.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="g_au_about-values">
          <h2 className="g_au_section-title">Our Core Values</h2>
          <div className="g_au_values-grid">
            <div className="g_au_value-card">
              <div className="g_au_value-icon">
                <FaAward />
              </div>
              <h3>Quality</h3>
              <p>
                We maintain the highest standards in every aspect of our operations, from breeding 
                to delivery.
              </p>
            </div>

            <div className="g_au_value-card">
              <div className="g_au_value-icon">
                <FaLeaf />
              </div>
              <h3>Sustainability</h3>
              <p>
                Environmental responsibility is at the heart of our practices, ensuring a better 
                future for all.
              </p>
            </div>

            <div className="g_au_value-card">
              <div className="g_au_value-icon">
                <FaShieldAlt />
              </div>
              <h3>Integrity</h3>
              <p>
                We operate with transparency and honesty, building trust with our customers and 
                partners.
              </p>
            </div>

            <div className="g_au_value-card">
              <div className="g_au_value-icon">
                <FaUsers />
              </div>
              <h3>Community</h3>
              <p>
                We support local communities and contribute to economic development through our 
                operations.
              </p>
            </div>

            <div className="g_au_value-card">
              <div className="g_au_value-icon">
                <FaHeart />
              </div>
              <h3>Care</h3>
              <p>
                We treat our fish with respect and ensure their wellbeing throughout their lifecycle.
              </p>
            </div>

            <div className="g_au_value-card">
              <div className="g_au_value-icon">
                <FaFish />
              </div>
              <h3>Excellence</h3>
              <p>
                We strive for continuous improvement in all our processes and services.
              </p>
            </div>
          </div>
        </div>

        {/* What We Offer Section */}
        <div className="g_au_about-offer">
          <h2 className="g_au_section-title">What We Offer</h2>
          <div className="g_au_offer-content">
            <div className="g_au_offer-item">
              <h3>Premium Fish Varieties</h3>
              <p>
                We specialize in breeding and raising a diverse range of fish species, including 
                freshwater, ornamental, and specialty varieties. Each fish is carefully selected 
                and raised to meet the highest quality standards.
              </p>
            </div>

            <div className="g_au_offer-item">
              <h3>Advanced Farm Management</h3>
              <p>
                Our state-of-the-art management system ensures optimal conditions for fish growth, 
                health monitoring, and efficient operations. We utilize modern technology to track 
                and manage every aspect of our farm.
              </p>
            </div>

            <div className="g_au_offer-item">
              <h3>Quality Assurance</h3>
              <p>
                Every fish undergoes rigorous health checks and quality assessments before reaching 
                our customers. We maintain strict standards to ensure you receive only the best.
              </p>
            </div>

            <div className="g_au_offer-item">
              <h3>Expert Consultation</h3>
              <p>
                Our experienced team is always ready to provide guidance on fish care, tank 
                management, and aquaculture best practices. We're committed to your success.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="g_au_about-stats">
          <div className="g_au_stat-item">
            <div className="g_au_stat-number">10+</div>
            <div className="g_au_stat-label">Years Experience</div>
          </div>
          <div className="g_au_stat-item">
            <div className="g_au_stat-number">50+</div>
            <div className="g_au_stat-label">Fish Varieties</div>
          </div>
          <div className="g_au_stat-item">
            <div className="g_au_stat-number">1000+</div>
            <div className="g_au_stat-label">Happy Customers</div>
          </div>
          <div className="g_au_stat-item">
            <div className="g_au_stat-number">100%</div>
            <div className="g_au_stat-label">Quality Guaranteed</div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="g_au_about-cta">
          <h2>Join Our Growing Community</h2>
          <p>
            Experience the difference that quality and care make. Contact us today to learn more 
            about our fish varieties and services.
          </p>
          <button className="g_au_cta-button" onClick={() => window.location.href = '/contact'}>
            Get In Touch
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;