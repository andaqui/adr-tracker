import React from 'react';
import { useAdrData } from '../context/AdrDataContext';
import { FiUpload } from 'react-icons/fi';

const Placeholder = () => {
  const { handleFileUpload } = useAdrData();

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="text-center py-12">
      <div className="mb-6">
        <FiUpload className="mx-auto text-6xl text-gray-300" />
      </div>
      <h2 className="text-2xl font-bold text-gray-700 mb-2">No ADR Report Loaded</h2>
      <p className="text-gray-500 mb-6">Upload a JSON report file to view the dashboard</p>
      <label htmlFor="fileInput-placeholder" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer transition-colors inline-flex items-center">
        <FiUpload className="mr-2" /> Upload Report
      </label>
      <input 
        type="file" 
        id="fileInput-placeholder" 
        className="hidden" 
        accept=".json"
        onChange={onFileChange}
      />
    </div>
  );
};

export default Placeholder;
