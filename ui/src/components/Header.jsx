import React from 'react';
import { useAdrData } from '../context/AdrDataContext';
import { FiUpload } from 'react-icons/fi';

const Header = () => {
  const { handleFileUpload } = useAdrData();

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">ADR Tracker Dashboard</h1>
        <div>
          <label htmlFor="fileInput" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer transition-colors inline-flex items-center">
            <FiUpload className="mr-2" /> Upload Report
          </label>
          <input 
            type="file" 
            id="fileInput" 
            className="hidden" 
            accept=".json" 
            onChange={onFileChange}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
