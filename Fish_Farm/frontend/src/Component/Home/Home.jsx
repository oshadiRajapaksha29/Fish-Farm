import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaCheckCircle, FaStar, FaAngleRight, FaAngleLeft, FaFacebook, FaTwitter, FaInstagram, FaFish, FaWater, FaLeaf, FaAward, FaUsers, FaShoppingCart } from 'react-icons/fa';
import './home.css';
// Import images
import certifiedIcon from '../../assets/images/certified-icon.jpg';
import organicIcon from '../../assets/images/organic-icon.jpg';
import qualityIcon from '../../assets/images/quality-icon.jpg';
import ceoAvatar from '../../assets/images/ceo-avatar.jpg';
import fishVarieties from '../../assets/images/fish-varieties.jpg';
import freshwaterFish from '../../assets/images/freshwater-fish.jpg';
import ornamentalFish from '../../assets/images/ornamental-fish.jpg';
import oceanFish from '../../assets/images/ocean-fish.jpg';
import aquariumFish from '../../assets/images/aquarium-fish.jpg';
import koiFish from '../../assets/images/koi-fish.jpg';
import fancyFish from '../../assets/images/fancy-fish.jpg';
import fishFarmAerial from '../../assets/images/fish-farm-aerial.jpg';
import testimonial1 from '../../assets/images/testimonial-1.jpg';
import testimonial2 from '../../assets/images/testimonial-2.jpg';
import testimonial3 from '../../assets/images/testimonial-3.jpg';
import blog1 from '../../assets/images/blog-1.jpg';
import blog2 from '../../assets/images/blog-2.jpg';
import blog3 from '../../assets/images/blog-3.jpg';
import processVideo from '../../assets/images/01_Homepage.jpg';
import partner1 from '../../assets/images/partner-1.jpg';
import partner2 from '../../assets/images/partner-2.jpg';
import partner3 from '../../assets/images/partner-3.jpg';
import partner4 from '../../assets/images/partner-4.webp';
import partner5 from '../../assets/images/partner-5.jpg';
// Using import instead of require for hero image
import heroBackgroundImage from '../../assets/images/hero-fish-farm.jpg';
import home1 from '../../assets/images/home3.avif';
import home2 from '../../assets/images/home5.avif';
import home3 from '../../assets/images/home4.avif'

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [heroImageError, setHeroImageError] = useState(false);
  const [statsInView, setStatsInView] = useState(false);
  const [counters, setCounters] = useState({
    customers: 0,
    species: 0,
    experience: 0,
    equipment: 0
  });
  
  const statsRef = useRef(null);
  const totalSlides = 3; // We have 3 testimonials
  
  // Hero images array - you can replace these with your 4 imported images
  const heroImages = [
    heroBackgroundImage,
    home1,
    home2,
    home3
  ];
  
  // Auto-rotate hero images every 5 seconds
  useEffect(() => {
    const heroInterval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds
    
    return () => clearInterval(heroInterval);
  }, []);
  
  // Intersection Observer for stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statsInView) {
          setStatsInView(true);
          animateCounters();
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [statsInView]);

  // Animate counter numbers
  const animateCounters = () => {
    const duration = 2000;
    const targets = { customers: 30000, species: 950, experience: 25, equipment: 650 };
    const increment = {
      customers: targets.customers / (duration / 16),
      species: targets.species / (duration / 16),
      experience: targets.experience / (duration / 16),
      equipment: targets.equipment / (duration / 16)
    };

    let frame = 0;
    const totalFrames = duration / 16;

    const counter = setInterval(() => {
      frame++;
      setCounters({
        customers: Math.min(Math.floor(increment.customers * frame), targets.customers),
        species: Math.min(Math.floor(increment.species * frame), targets.species),
        experience: Math.min(Math.floor(increment.experience * frame), targets.experience),
        equipment: Math.min(Math.floor(increment.equipment * frame), targets.equipment)
      });

      if (frame >= totalFrames) {
        clearInterval(counter);
        setCounters(targets);
      }
    }, 16);
  };
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };
  return (
    <div className="g_home_container">
      {/* Hero Section with Sliding Carousel */}
      <section className="g_home_hero">
        {/* Sliding Image Container */}
        <div className="g_home_hero_slider_container">
          <div 
            className="g_home_hero_slider_track"
            style={{
              transform: `translateX(-${currentHeroImage * 100}%)`,
              transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {heroImages.map((image, index) => (
              <div
                key={index}
                className="g_home_hero_slide"
                style={{
                  backgroundImage: `url(${image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Navigation Arrows */}
        <button 
          className="g_home_hero_arrow g_home_hero_arrow_left"
          onClick={() => setCurrentHeroImage((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1))}
          aria-label="Previous slide"
        >
          <FaAngleLeft />
        </button>
        <button 
          className="g_home_hero_arrow g_home_hero_arrow_right"
          onClick={() => setCurrentHeroImage((prev) => (prev + 1) % heroImages.length)}
          aria-label="Next slide"
        >
          <FaAngleRight />
        </button>
        
        {/* Slider Navigation Dots */}
        <div className="g_home_hero_dots">
          {heroImages.map((_, index) => (
            <button
              key={index}
              className={`g_home_hero_dot ${index === currentHeroImage ? 'active' : ''}`}
              onClick={() => setCurrentHeroImage(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Animated Gradient Overlay */}
        <div className="g_home_overlay"></div>
        
        {/* Floating Particles */}
        <div className="g_home_particles">
          <div className="g_home_particle g_home_particle_1"></div>
          <div className="g_home_particle g_home_particle_2"></div>
          <div className="g_home_particle g_home_particle_3"></div>
          <div className="g_home_particle g_home_particle_4"></div>
          <div className="g_home_particle g_home_particle_5"></div>
          <div className="g_home_particle g_home_particle_6"></div>
        </div>

        {/* Animated Wave */}
        <div className="g_home_wave_animation">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 Q300,60 600,30 T1200,0 L1200,120 L0,120 Z" fill="rgba(6, 182, 212, 0.1)"></path>
          </svg>
        </div>
        
        <div className="g_home_hero_content">
          <div className="g_home_hero_badge">
            <FaAward /> Premium Quality Since 2000
          </div>
          <h1 className="g_home_hero_title_animated">Aqua Peak</h1>
          <h2 className="g_home_hero_subtitle_animated">For The Aqua Fish Lovers</h2>
          <p className="g_home_hero_text_animated">Premium quality fish varieties available with best fish farming management system</p>
          <div className="g_home_hero_buttons">
            <Link to="/shop/food-medicine" className="g_home_button g_home_button_primary g_home_button_glow">
              <FaShoppingCart /> Shop Now
            </Link>
            <Link to="/about" className="g_home_button g_home_button_outlined g_home_button_glass">
              Learn More
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="g_home_scroll_indicator">
          <div className="g_home_scroll_mouse">
            <div className="g_home_scroll_wheel"></div>
          </div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* Glassmorphism Feature Cards */}
      <section className="g_home_features">
        <div className="g_home_feature_card g_home_glass_card">
          <div className="g_home_feature_icon_modern">
            <div className="g_home_icon_bg g_home_icon_bg_1">
              <FaAward />
            </div>
          </div>
          <h3>Certified Farm</h3>
          <p>All fish are raised in certified and regulated environments</p>
          <div className="g_home_feature_badge">100% Certified</div>
        </div>
        <div className="g_home_feature_card g_home_glass_card">
          <div className="g_home_feature_icon_modern">
            <div className="g_home_icon_bg g_home_icon_bg_2">
              <FaLeaf />
            </div>
          </div>
          <h3>Organic Fish</h3>
          <p>No added chemicals or hormones in our fish growing process</p>
          <div className="g_home_feature_badge">100% Organic</div>
        </div>
        <div className="g_home_feature_card g_home_glass_card">
          <div className="g_home_feature_icon_modern">
            <div className="g_home_icon_bg g_home_icon_bg_3">
              <FaFish />
            </div>
          </div>
          <h3>High Quality</h3>
          <p>Premium quality fish with best nutritional values guaranteed</p>
          <div className="g_home_feature_badge">Premium Quality</div>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="g_home_wave_divider">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 Q300,80 600,40 T1200,0 L1200,120 L0,120 Z" fill="#f0f9ff"></path>
        </svg>
      </div>

      {/* About Section */}
      <section className="g_home_about">
        <div className="g_home_about_content">
          <div className="g_home_about_text">
            <h2>We Make You Healthy With <span>Aqua Fresh Fishes</span></h2>
            <p>
              Premium quality fish farms that deliver excellent taste and nutritional benefits.
              Our fish farming techniques ensure that you get the healthiest options for your diet.
              We follow sustainable practices to maintain the ecosystem balance while delivering
              high-quality fish products.
            </p>
            <div className="g_home_about_features">
              <div className="g_home_about_feature">
                <FaCheckCircle className="g_home_check_icon" />
                <span>The Healthiest Fish Selection</span>
              </div>
              <div className="g_home_about_feature">
                <FaCheckCircle className="g_home_check_icon" />
                <span>The Perfect Fish Packaging</span>
              </div>
              <div className="g_home_about_feature">
                <FaCheckCircle className="g_home_check_icon" />
                <span>Trusted Farm Practices</span>
              </div>
              <div className="g_home_about_feature">
                <FaCheckCircle className="g_home_check_icon" />
                <span>Regulated Food Standards</span>
              </div>
            </div>
            <div className="g_home_quote">
              <p>"We promise to deliver the best quality aquatic products for your healthy lifestyle"</p>
              <div className="g_home_quote_author">
                <img src={ceoAvatar} alt="CEO" />
                <div>
                  <h4>Yapa Bandara</h4>
                  <span>Founder & CEO</span>
                </div>
              </div>
            </div>
            <Link to="/shop" className="g_home_button g_home_button_primary">Shop Now</Link>
          </div>
          <div className="g_home_about_image">
            <img src={fishVarieties} alt="Fish Varieties" />
          </div>
        </div>
      </section>

      {/* Fish Categories Section with Enhanced Cards */}
      <section className="g_home_categories">
        <div className="g_home_section_header">
          <h2>Fish Farming Start With Us</h2>
          <p>Explore our wide variety of fish species suitable for various farming needs</p>
        </div>
        <div className="g_home_category_grid">
          <div className="g_home_category_card g_home_category_enhanced">
            <div className="g_home_category_image">
              <img src={freshwaterFish} alt="Freshwater Fish" />
              <div className="g_home_category_overlay"></div>
              <div className="g_home_category_badge g_home_badge_popular">Popular</div>
            </div>
            <div className="g_home_category_content">
              <h3>Freshwater Fish</h3>
              <p>Find various freshwater fishes suitable for ponds and tanks</p>
              <Link to="/categories/freshwater" className="g_home_category_link">Discover <FaAngleRight /></Link>
            </div>
          </div>
          <div className="g_home_category_card g_home_category_enhanced">
            <div className="g_home_category_image">
              <img src={ornamentalFish} alt="Ornamental Fish" />
              <div className="g_home_category_overlay"></div>
              <div className="g_home_category_badge g_home_badge_new">New</div>
            </div>
            <div className="g_home_category_content">
              <h3>Ornamental Fish</h3>
              <p>Beautiful decorative fish species for aquariums and displays</p>
              <Link to="/categories/ornamental" className="g_home_category_link">Discover <FaAngleRight /></Link>
            </div>
          </div>
          <div className="g_home_category_card g_home_category_enhanced">
            <div className="g_home_category_image">
              <img src={oceanFish} alt="Ocean Fish" />
              <div className="g_home_category_overlay"></div>
            </div>
            <div className="g_home_category_content">
              <h3>Ocean Care</h3>
              <p>Solutions for maintaining ocean fish in controlled environments</p>
              <Link to="/categories/ocean" className="g_home_category_link">Discover <FaAngleRight /></Link>
            </div>
          </div>
          <div className="g_home_category_card g_home_category_enhanced">
            <div className="g_home_category_image">
              <img src={aquariumFish} alt="Aquarium Fish" />
              <div className="g_home_category_overlay"></div>
              <div className="g_home_category_badge g_home_badge_bestseller">Best Seller</div>
            </div>
            <div className="g_home_category_content">
              <h3>Aquarium Fish</h3>
              <p>Perfect species for home and professional aquariums</p>
              <Link to="/categories/aquarium" className="g_home_category_link">Discover <FaAngleRight /></Link>
            </div>
          </div>
          <div className="g_home_category_card g_home_category_enhanced">
            <div className="g_home_category_image">
              <img src={koiFish} alt="Koi Fish" />
              <div className="g_home_category_overlay"></div>
            </div>
            <div className="g_home_category_content">
              <h3>Plantation Fish</h3>
              <p>Fish species suitable for plantation and large scale farming</p>
              <Link to="/categories/plantation" className="g_home_category_link">Discover <FaAngleRight /></Link>
            </div>
          </div>
          <div className="g_home_category_card g_home_category_enhanced">
            <div className="g_home_category_image">
              <img src={fancyFish} alt="Fancy Fish" />
              <div className="g_home_category_overlay"></div>
            </div>
            <div className="g_home_category_content">
              <h3>Fancy Fish</h3>
              <p>Unique and exotic fish varieties for collectors and enthusiasts</p>
              <Link to="/categories/fancy" className="g_home_category_link">Discover <FaAngleRight /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Food & Medicine Section */}
      <section className="g_home_categories">
        <div className="g_home_section_header">
          <h2>Food & Medicine</h2>
          <p>Explore our wide variety of quality food and medicines for your fish</p>
        </div>
        <div className="g_home_category_grid">
          <div className="g_home_category_card">
            <div className="g_home_category_image">
              <img src={blog1} alt="Fish Food" />
            </div>
            <h3>Fish Food</h3>
            <p>Premium quality food to keep your fish healthy and active</p>
            <Link to="/shop/food-medicine" className="g_home_category_link">Discover <FaAngleRight /></Link>
          </div>
          <div className="g_home_category_card">
            <div className="g_home_category_image">
              <img src={blog2} alt="Supplements" />
            </div>
            <h3>Fish Supplements</h3>
            <p>Essential supplements to enhance fish growth and health</p>
            <Link to="/shop/food-medicine" className="g_home_category_link">Discover <FaAngleRight /></Link>
          </div>
          <div className="g_home_category_card">
            <div className="g_home_category_image">
              <img src={blog3} alt="Medicine" />
            </div>
            <h3>Fish Medicine</h3>
            <p>Effective treatments for common fish diseases and conditions</p>
            <Link to="/shop/food-medicine" className="g_home_category_link">Discover <FaAngleRight /></Link>
          </div>
        </div>
      </section>
      
      {/* Accessories Section */}
      <section className="g_home_categories">
        <div className="g_home_section_header">
          <h2>Aquarium Accessories</h2>
          <p>Everything you need to set up and maintain your perfect aquarium</p>
        </div>
        <div className="g_home_category_grid">
          <div className="g_home_category_card">
            <div className="g_home_category_image">
              <img src={partner1} alt="Tanks" />
            </div>
            <h3>Tanks & Containers</h3>
            <p>High-quality tanks in various sizes for all your needs</p>
            <Link to="/dashboard/homeaccessories" className="g_home_category_link">Discover <FaAngleRight /></Link>
          </div>
          <div className="g_home_category_card">
            <div className="g_home_category_image">
              <img src={partner2} alt="Filters" />
            </div>
            <h3>Filters & Pumps</h3>
            <p>Essential equipment for water circulation and filtration</p>
            <Link to="/dashboard/homeaccessories" className="g_home_category_link">Discover <FaAngleRight /></Link>
          </div>
          <div className="g_home_category_card">
            <div className="g_home_category_image">
              <img src={partner3} alt="Decorations" />
            </div>
            <h3>Decorations</h3>
            <p>Beautiful items to enhance your aquarium's appearance</p>
            <Link to="/dashboard/homeaccessories" className="g_home_category_link">Discover <FaAngleRight /></Link>
          </div>
        </div>
      </section>

      {/* Stats Section with Animated Counters */}
      <section className="g_home_stats" ref={statsRef}>
        <div className="g_home_stats_content">
          <div className="g_home_stats_text">
            <span className="g_home_stats_label">
              <FaWater /> WHAT WE PROVIDE YOU
            </span>
            <h2>Complete Destination For Aqua Farming</h2>
            <p>
              We are your one-stop destination for all things related to fish farming. 
              From quality fish breeds to expert advice and equipment, we provide everything
              you need to succeed in aquaculture.
            </p>
            <div className="g_home_stats_grid">
              <div className="g_home_stat_item g_home_stat_animated">
                <div className="g_home_stat_icon">
                  <FaUsers />
                </div>
                <div className="g_home_stat_number">{counters.customers.toLocaleString()}+</div>
                <div className="g_home_stat_label">Satisfied Customers</div>
              </div>
              <div className="g_home_stat_item g_home_stat_animated">
                <div className="g_home_stat_icon">
                  <FaFish />
                </div>
                <div className="g_home_stat_number">{counters.species}+</div>
                <div className="g_home_stat_label">Fish Species Available</div>
              </div>
              <div className="g_home_stat_item g_home_stat_animated">
                <div className="g_home_stat_icon">
                  <FaAward />
                </div>
                <div className="g_home_stat_number">{counters.experience}+</div>
                <div className="g_home_stat_label">Years of Experience</div>
              </div>
              <div className="g_home_stat_item g_home_stat_animated">
                <div className="g_home_stat_icon">
                  <FaShoppingCart />
                </div>
                <div className="g_home_stat_number">{counters.equipment}+</div>
                <div className="g_home_stat_label">Farming Equipment</div>
              </div>
            </div>
            <Link to="/services" className="g_home_button g_home_button_primary g_home_button_glow">Explore More</Link>
          </div>
          <div className="g_home_stats_image">
            <div className="g_home_image_wrapper">
              <img src={fishFarmAerial} alt="Fish Farm Aerial View" />
              <div className="g_home_image_overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Wave Divider */}
      <div className="g_home_wave_divider g_home_wave_inverted">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 Q300,80 600,40 T1200,0 L1200,120 L0,120 Z" fill="#ffffff"></path>
        </svg>
      </div>

      {/* Removed Process Section */}

      {/* Testimonials Section */}
      <section className="g_home_testimonials">
        <div className="g_home_section_header">
          <h2>See What Our Client Say</h2>
          <p>Trusted by thousands of fish farmers and aquaculture enthusiasts across the country</p>
        </div>
        <div className="g_home_testimonial_slider">
          <div className="g_home_testimonial_controls">
            <button className="g_home_testimonial_arrow g_home_prev" onClick={prevSlide}><FaAngleLeft /></button>
            <button className="g_home_testimonial_arrow g_home_next" onClick={nextSlide}><FaAngleRight /></button>
          </div>
          <div className="g_home_testimonial_wrapper" style={{ transform: `translateX(-${currentSlide * 100 / 3}%)`, transition: 'transform 0.5s ease-in-out' }}>
            <div className="g_home_testimonial_card">
              <div className="g_home_testimonial_rating">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <p>"Their fish farming equipment transformed my small business. The quality and support are exceptional!"</p>
              <div className="g_home_testimonial_author">
                <img src={testimonial1} alt="Client" />
                <div>
                  <h4>Michael Brown</h4>
                  <span>Fish Farm Owner</span>
                </div>
              </div>
            </div>
            <div className="g_home_testimonial_card">
              <div className="g_home_testimonial_rating">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <p>"The ornamental fish varieties I purchased were healthy and vibrant. Will definitely buy again!"</p>
              <div className="g_home_testimonial_author">
                <img src={testimonial2} alt="Client" />
                <div>
                  <h4>Sarah Johnson</h4>
                  <span>Aquarium Enthusiast</span>
                </div>
              </div>
            </div>
            <div className="g_home_testimonial_card">
              <div className="g_home_testimonial_rating">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
              <p>"The expert advice from their team helped me set up a profitable commercial fish farm in record time."</p>
              <div className="g_home_testimonial_author">
                <img src={testimonial3} alt="Client" />
                <div>
                  <h4>David Wilson</h4>
                  <span>Commercial Farmer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog/Activities Section */}
      <section className="g_home_blog">
        <div className="g_home_section_header">
          <h2>Our Latest Top Activities</h2>
          <p>Stay updated with our latest news, tips, and developments in fish farming</p>
        </div>
        <div className="g_home_blog_grid">
          <div className="g_home_blog_card">
            <div className="g_home_blog_image">
              <img src={blog1} alt="Blog Post" />
              <div className="g_home_blog_tag">Farming</div>
            </div>
            <div className="g_home_blog_content">
              <h3>How to Setup Your Farming Pond Right</h3>
              <p>Learn the essential steps to prepare your pond for successful fish farming</p>
              <Link to="/blog/pond-setup" className="g_home_blog_link">Read More</Link>
            </div>
          </div>
          <div className="g_home_blog_card">
            <div className="g_home_blog_image">
              <img src={blog2} alt="Blog Post" />
              <div className="g_home_blog_tag">Care</div>
            </div>
            <div className="g_home_blog_content">
              <h3>5 Ways To Keep Your Fishes Healthy</h3>
              <p>Discover proven methods to maintain optimal health for your aquatic pets</p>
              <Link to="/blog/fish-health" className="g_home_blog_link">Read More</Link>
            </div>
          </div>
          <div className="g_home_blog_card">
            <div className="g_home_blog_image">
              <img src={blog3} alt="Blog Post" />
              <div className="g_home_blog_tag">Business</div>
            </div>
            <div className="g_home_blog_content">
              <h3>Scaling Your Fish Farm Business</h3>
              <p>Expert tips on how to expand your fish farming operation successfully</p>
              <Link to="/blog/scaling-business" className="g_home_blog_link">Read More</Link>
            </div>
          </div>
        </div>
        <div className="g_home_blog_action">
          <Link to="/blog" className="g_home_button g_home_button_secondary">View All</Link>
        </div>
      </section>

      {/* Partners Section */}
      <section className="g_home_partners">
        <div className="g_home_partners_grid">
          <div className="g_home_partner">
            <img src={partner1} alt="Partner" />
          </div>
          <div className="g_home_partner">
            <img src={partner2} alt="Partner" />
          </div>
          <div className="g_home_partner">
            <img src={partner3} alt="Partner" />
          </div>
          <div className="g_home_partner">
            <img src={partner4} alt="Partner" />
          </div>
          <div className="g_home_partner">
            <img src={partner5} alt="Partner" />
          </div>
        </div>
      </section>

      {/* Removed Newsletter Section */}
    </div>
  );
};

export default Home;
