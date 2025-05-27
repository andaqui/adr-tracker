import React, { useState, useEffect, useRef } from 'react';
import { useAdrData } from '../../context/AdrDataContext';
import { FiSearch, FiArrowRight } from 'react-icons/fi';
import { useModal } from '../Modal';

const AdrsPanel = () => {
  const { 
    adrData,
    searchTerm,
    setSearchTerm,
    statusFilters,
    setStatusFilters,
    currentPage,
    setCurrentPage,
    getPaginationInfo,
    getReferencesForAdr
  } = useAdrData();

  const { openModal } = useModal();
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchResultsRef = useRef(null);
  const searchInputRef = useRef(null);

  // Get pagination information
  const { 
    currentItems, 
    totalItems, 
    totalPages, 
    hasNextPage, 
    hasPrevPage 
  } = getPaginationInfo();

  // Handle search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSearchResults(value.trim().length > 0);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilters({
      ...statusFilters,
      [status]: !statusFilters[status]
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (page === 'prev' && hasPrevPage) {
      setCurrentPage(currentPage - 1);
    } else if (page === 'next' && hasNextPage) {
      setCurrentPage(currentPage + 1);
    } else if (typeof page === 'number') {
      setCurrentPage(page);
    }
    // Scroll to top of container
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show ADR details in a modal
  const showAdrDetails = (id) => {
    const doc = adrData.documents.find(d => d.id === id);
    if (!doc) return;
    
    const references = getReferencesForAdr(id);
    const refCount = references.length;
    
    openModal({
      title: `${doc.id} - ${doc.title}`,
      content: (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">Status</p>
              <p><span className={`status-badge status-${doc.status.toLowerCase()}`}>{doc.status}</span></p>
            </div>
            {doc.date && (
              <div>
                <p className="text-gray-600 text-sm mb-1">Date</p>
                <p>{doc.date}</p>
              </div>
            )}
          </div>
          
          {doc.tags && doc.tags.length > 0 && (
            <div className="mb-4">
              <p className="text-gray-600 text-sm mb-1">Tags</p>
              <div>
                {doc.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <p className="text-gray-600 text-sm mb-1">Path</p>
            <p className="text-gray-800 break-words">{doc.path}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-600 text-sm mb-1">References in Code</p>
            <p>{refCount}</p>
          </div>
          
          {refCount > 0 && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h4 className="font-semibold text-lg mb-2">References</h4>
              <ReferencesList references={references} />
            </div>
          )}
        </div>
      ),
      size: 'lg'
    });
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchResultsRef.current && 
        !searchResultsRef.current.contains(event.target) &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!adrData) return null;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
            placeholder="Search ADRs by ID, title, or tags..."
          />
          {showSearchResults && (
            <div 
              ref={searchResultsRef}
              className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg w-full mt-1 max-h-60 overflow-y-auto"
            >
              <SearchResults 
                onSelectAdr={(id) => {
                  setShowSearchResults(false);
                  showAdrDetails(id);
                }} 
              />
            </div>
          )}
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="statusAccepted"
              checked={statusFilters.accepted}
              onChange={() => handleStatusFilterChange('accepted')}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="statusAccepted" className="ml-2 text-sm font-medium text-gray-900">
              Accepted
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="statusProposed"
              checked={statusFilters.proposed}
              onChange={() => handleStatusFilterChange('proposed')}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="statusProposed" className="ml-2 text-sm font-medium text-gray-900">
              Proposed
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="statusRejected"
              checked={statusFilters.rejected}
              onChange={() => handleStatusFilterChange('rejected')}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="statusRejected" className="ml-2 text-sm font-medium text-gray-900">
              Rejected
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="statusDeprecated"
              checked={statusFilters.deprecated}
              onChange={() => handleStatusFilterChange('deprecated')}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="statusDeprecated" className="ml-2 text-sm font-medium text-gray-900">
              Deprecated
            </label>
          </div>
        </div>
      </div>
      
      {/* ADRs List */}
      {currentItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentItems.map((doc) => {
            const refCount = adrData.references.filter(ref => ref.id === doc.id).length;
            
            return (
              <div 
                key={doc.id}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-lg"
              >
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-bold text-lg">{doc.id}</h3>
                  <p className="text-gray-700">{doc.title}</p>
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-sm text-gray-600 mr-2">Status:</span>
                    <span className={`status-badge status-${doc.status.toLowerCase()}`}>{doc.status}</span>
                  </div>
                  {doc.date && (
                    <p className="text-sm mb-2">
                      <span className="text-gray-600">Date:</span> {doc.date}
                    </p>
                  )}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm text-gray-600 mr-2">Tags:</span>
                      {doc.tags.map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm mb-2">
                    <span className="text-gray-600">References:</span> {refCount}
                  </p>
                  <p className="text-sm text-gray-500 truncate" title={doc.path}>
                    <span className="text-gray-600">Path:</span> {doc.path}
                  </p>
                  <button
                    className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                    onClick={() => showAdrDetails(doc.id)}
                  >
                    View Details <FiArrowRight className="ml-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">
          No ADR documents match the current filters
        </p>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-1">
            {/* Previous button */}
            <button
              className={`px-3 py-1 border border-gray-300 rounded-md transition-colors ${
                hasPrevPage
                  ? 'hover:bg-gray-100'
                  : 'opacity-50 cursor-not-allowed hover:bg-white'
              }`}
              onClick={() => handlePageChange('prev')}
              disabled={!hasPrevPage}
            >
              <span className="sr-only">Previous</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            {/* Page numbers */}
            <PaginationNumbers
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
            
            {/* Next button */}
            <button
              className={`px-3 py-1 border border-gray-300 rounded-md transition-colors ${
                hasNextPage
                  ? 'hover:bg-gray-100'
                  : 'opacity-50 cursor-not-allowed hover:bg-white'
              }`}
              onClick={() => handlePageChange('next')}
              disabled={!hasNextPage}
            >
              <span className="sr-only">Next</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Search Results Component
const SearchResults = ({ onSelectAdr }) => {
  const { adrData, searchTerm, getFilteredDocuments } = useAdrData();
  
  if (!adrData) return null;
  
  // Filter documents by search term
  const allFilteredDocs = getFilteredDocuments();
  const matchingDocs = allFilteredDocs.filter(doc => 
    doc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );
  
  if (matchingDocs.length === 0) {
    return <div className="p-3 text-gray-500">No matching ADRs found</div>;
  }
  
  // Show at most 5 results in the dropdown
  const resultsToShow = matchingDocs.slice(0, 5);
  
  return (
    <>
      {resultsToShow.map(doc => (
        <div
          key={doc.id}
          className="p-3 hover:bg-gray-100 cursor-pointer"
          onClick={() => onSelectAdr(doc.id)}
        >
          <div className="font-medium">{doc.id} - {doc.title}</div>
          <div className="text-sm text-gray-500 flex items-center">
            <span className={`status-badge status-${doc.status.toLowerCase()} mr-2`}>
              {doc.status}
            </span>
            {doc.tags && doc.tags.length > 0 && (
              <span className="text-xs text-gray-500">{doc.tags.join(', ')}</span>
            )}
          </div>
        </div>
      ))}
    </>
  );
};

// Pagination Numbers Component
const PaginationNumbers = ({ currentPage, totalPages, onPageChange }) => {
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  // Adjust if we're near the end
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  const pageNumbers = [];
  
  // First page
  if (startPage > 1) {
    pageNumbers.push(
      <button
        key="1"
        className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        onClick={() => onPageChange(1)}
      >
        1
      </button>
    );
    
    if (startPage > 2) {
      pageNumbers.push(
        <span key="ellipsis1" className="px-3 py-1 border border-gray-300 rounded-md opacity-50 cursor-not-allowed">
          ...
        </span>
      );
    }
  }
  
  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(
      <button
        key={i}
        className={`px-3 py-1 border rounded-md transition-colors ${
          i === currentPage
            ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
            : 'border-gray-300 hover:bg-gray-100'
        }`}
        onClick={() => onPageChange(i)}
      >
        {i}
      </button>
    );
  }
  
  // Last page
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pageNumbers.push(
        <span key="ellipsis2" className="px-3 py-1 border border-gray-300 rounded-md opacity-50 cursor-not-allowed">
          ...
        </span>
      );
    }
    
    pageNumbers.push(
      <button
        key={totalPages}
        className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
        onClick={() => onPageChange(totalPages)}
      >
        {totalPages}
      </button>
    );
  }
  
  return <>{pageNumbers}</>;
};

// References List Component
const ReferencesList = ({ references }) => {
  if (references.length === 0) {
    return <p className="text-gray-500">No references found</p>;
  }
  
  // Group references by file
  const fileMap = {};
  references.forEach(ref => {
    if (!fileMap[ref.file]) {
      fileMap[ref.file] = [];
    }
    fileMap[ref.file].push(ref);
  });
  
  const files = Object.keys(fileMap).sort();
  
  return (
    <div className="space-y-4">
      {files.map(file => {
        const fileRefs = fileMap[file];
        
        return (
          <div key={file}>
            <p className="font-medium">{file.split('/').pop()}</p>
            <p className="text-gray-500 text-sm mb-2">{file}</p>
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 text-left">Line</th>
                  <th className="py-2 px-3 text-left">Comment Type</th>
                </tr>
              </thead>
              <tbody>
                {fileRefs.map((ref, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2 px-3">{ref.line}</td>
                    <td className="py-2 px-3">
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        {formatCommentType(ref.commentType)}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

// Format comment type for display
const formatCommentType = (commentType) => {
  return commentType
    .replace(/\\/g, '')
    .replace(/\/\//g, '// ')
    .replace(/\/\*/g, '/* ')
    .replace(/\*\//g, ' */')
    .replace(/\*/g, '*');
};

export default AdrsPanel;
