import React, { createContext, useState, useContext, useEffect } from 'react';
// Import sample data directly
import sampleReportData from '../../sample-report.json';

const AdrDataContext = createContext();

export const useAdrData = () => useContext(AdrDataContext);

export const AdrDataProvider = ({ children }) => {
  const [adrData, setAdrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState({
    accepted: true,
    proposed: true,
    rejected: true,
    deprecated: true,
    unknown: true
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  // Load sample data on component mount
  useEffect(() => {
    // Use the directly imported sample data
    try {
      setLoading(true);
      setAdrData(sampleReportData);
      setError(null);
    } catch (err) {
      console.error('Could not load sample report:', err.message);
      setError('Failed to load sample data. Please upload a report file manually.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileUpload = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        setAdrData(data);
        setError(null);
      } catch (err) {
        setError('Error parsing JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Get filtered documents based on current filters and search term
  const getFilteredDocuments = () => {
    if (!adrData || !adrData.documents) return [];

    return adrData.documents.filter(doc => {
      // Filter by status
      if (!statusFilters[doc.status.toLowerCase()]) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm && !matchesSearchTerm(doc, searchTerm)) {
        return false;
      }
      
      return true;
    });
  };

  // Check if an ADR document matches the search term
  const matchesSearchTerm = (doc, term) => {
    const lowerTerm = term.toLowerCase().trim();
    return (
      doc.id.toLowerCase().includes(lowerTerm) ||
      doc.title.toLowerCase().includes(lowerTerm) ||
      (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(lowerTerm)))
    );
  };

  // Calculate pagination information
  const getPaginationInfo = () => {
    const filteredDocs = getFilteredDocuments();
    const totalItems = filteredDocs.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Ensure current page is valid
    let validCurrentPage = currentPage;
    if (validCurrentPage < 1) validCurrentPage = 1;
    if (validCurrentPage > totalPages) validCurrentPage = Math.max(1, totalPages);
    
    // Get current page items
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentItems = filteredDocs.slice(startIndex, endIndex);
    
    return {
      currentItems,
      totalItems,
      totalPages,
      currentPage: validCurrentPage,
      hasNextPage: validCurrentPage < totalPages,
      hasPrevPage: validCurrentPage > 1
    };
  };

  // Get status distribution
  const getStatusDistribution = () => {
    if (!adrData || !adrData.documents) {
      return { accepted: 0, proposed: 0, rejected: 0, deprecated: 0, unknown: 0 };
    }
    
    const distribution = {
      accepted: 0,
      proposed: 0,
      rejected: 0,
      deprecated: 0,
      unknown: 0
    };
    
    adrData.documents.forEach(doc => {
      const status = doc.status.toLowerCase();
      if (distribution.hasOwnProperty(status)) {
        distribution[status]++;
      } else {
        distribution.unknown++;
      }
    });
    
    return distribution;
  };

  // Get issues by type
  const getIssuesByType = () => {
    if (!adrData || !adrData.issues || adrData.issues.length === 0) {
      return {};
    }
    
    const issuesByType = {};
    adrData.issues.forEach(issue => {
      if (!issuesByType[issue.type]) {
        issuesByType[issue.type] = [];
      }
      issuesByType[issue.type].push(issue);
    });
    
    return issuesByType;
  };

  // Get references for an ADR
  const getReferencesForAdr = (id) => {
    if (!adrData || !adrData.references) return [];
    return adrData.references.filter(ref => ref.id === id);
  };

  // Get references for a file
  const getReferencesForFile = (file) => {
    if (!adrData || !adrData.references) return [];
    return adrData.references.filter(ref => ref.file === file);
  };

  // Get files with references
  const getFilesWithReferences = () => {
    if (!adrData || !adrData.references || adrData.references.length === 0) {
      return [];
    }
    
    const fileMap = {};
    adrData.references.forEach(ref => {
      if (!fileMap[ref.file]) {
        fileMap[ref.file] = {
          file: ref.file,
          references: []
        };
      }
      fileMap[ref.file].references.push(ref);
    });
    
    // Convert to array and sort by file name
    return Object.values(fileMap).sort((a, b) => 
      a.file.localeCompare(b.file)
    );
  };

  return (
    <AdrDataContext.Provider
      value={{
        adrData,
        loading,
        error,
        activeTab,
        searchTerm,
        statusFilters,
        currentPage,
        itemsPerPage,
        setAdrData,
        setLoading,
        setError,
        setActiveTab,
        setSearchTerm,
        setStatusFilters,
        setCurrentPage,
        handleFileUpload,
        getFilteredDocuments,
        getPaginationInfo,
        getStatusDistribution,
        getIssuesByType,
        getReferencesForAdr,
        getReferencesForFile,
        getFilesWithReferences
      }}
    >
      {children}
    </AdrDataContext.Provider>
  );
};

export default AdrDataContext;
