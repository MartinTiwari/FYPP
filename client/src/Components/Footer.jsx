import React from 'react';
import '../CSS/footer.css'; // Import your CSS file for styling


const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <p className='footertext'>&copy; {new Date().getFullYear()} NepFlicks. All rights reserved.</p>
        <ul className="footer-links">
          <li><button onClick={() => console.log("Privacy Policy clicked")}>Privacy Policy</button></li>
          <li><button onClick={() => console.log("Terms of Service clicked")}>Terms of Service</button></li>
          <li><button onClick={() => console.log("Contact Us clicked")}>Contact Us</button></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
