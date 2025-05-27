import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
        <p>ADR Checker Dashboard &copy; {currentYear}</p>
      </div>
    </footer>
  );
};

export default Footer;
