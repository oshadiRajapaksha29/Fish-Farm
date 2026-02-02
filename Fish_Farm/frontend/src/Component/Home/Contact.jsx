import React from 'react';

const Contact = () => {
  return (
    <div style={{ padding: '50px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Contact Us</h1>
      <p>
        Have questions about Aqua-Peak Fish Farm? Feel free to get in touch with us!
      </p>
      
      <div style={{ marginTop: '30px' }}>
        <h3>Our Location</h3>
        <p>123 Fish Farm Lane</p>
        <p>Aqua City, AC 12345</p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Contact Information</h3>
        <p>Email: info@aquapeak.com</p>
        <p>Phone: (123) 456-7890</p>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h3>Send Us a Message</h3>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px' }}>
          <input 
            type="text" 
            placeholder="Your Name" 
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <input 
            type="email" 
            placeholder="Your Email" 
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <textarea 
            placeholder="Your Message" 
            rows="5"
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          ></textarea>
          <button 
            type="submit"
            style={{ 
              padding: '12px', 
              backgroundColor: '#0062cc', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;