/**
 * Highlight an ADR in the list
 */
function highlightAdr(id) {
  // Make sure we're on the right page
  const allDocs = getFilteredDocuments();
  const docIndex = allDocs.findIndex(doc => doc.id === id);
  
  if (docIndex === -1) return;
  
  const pageNumber = Math.floor(docIndex / itemsPerPage) + 1;
  currentPage = pageNumber;
  
  // Re-render with the correct page
  renderAdrDocuments();
  
  // Highlight the ADR
  setTimeout(() => {
    const adrElement = document.querySelector(`[data-adr-id="${id}"]`);
    if (adrElement) {
      adrElement.classList.add('ring-2', 'ring-blue-500');
      adrElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Remove highlight after a few seconds
      setTimeout(() => {
        adrElement.classList.remove('ring-2', 'ring-blue-500');
      }, 3000);
    }
  }, 100);
}

/**
 * Render ADR documents section with pagination
 */
function renderAdrDocuments() {
  if (!adrData || !adrData.documents || adrData.documents.length === 0) {
    adrsContainer.innerHTML = '<p class="text-gray-500 text-center py-8">No ADR documents found</p>';
    adrsPagination.innerHTML = '';
    return;
  }
  
  // Get filtered documents
  const filteredDocs = getFilteredDocuments();
  
  if (filteredDocs.length === 0) {
    adrsContainer.innerHTML = '<p class="text-gray-500 text-center py-8">No ADR documents match the current filters</p>';
    adrsPagination.innerHTML = '';
    return;
  }
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
  
  // Ensure current page is valid
  if (currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;
  
  // Get current page items
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredDocs.length);
  const currentPageItems = filteredDocs.slice(startIndex, endIndex);
  
  let html = '';
  
  currentPageItems.forEach(doc => {
    const refCount = adrData.references.filter(ref => ref.id === doc.id).length;
    const statusClass = getStatusClass(doc.status);
    
    html += `
      <div class="adr-card transition-all duration-300" data-adr-id="${doc.id}">
        <div class="p-4 border-b border-gray-200">
          <h3 class="font-bold text-lg">${doc.id}</h3>
          <p class="text-gray-700">${doc.title}</p>
        </div>
        <div class="p-4">
          <div class="flex items-center mb-2">
            <span class="text-sm text-gray-600 mr-2">Status:</span>
            <span class="status-badge ${statusClass}">${doc.status}</span>
          </div>
          ${doc.date ? `<p class="text-sm mb-2"><span class="text-gray-600">Date:</span> ${doc.date}</p>` : ''}
          ${doc.tags && doc.tags.length > 0 ? `
          <div class="mb-2">
            <span class="text-sm text-gray-600 mr-2">Tags:</span>
            ${doc.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}
          </div>
          ` : ''}
          <p class="text-sm mb-2"><span class="text-gray-600">References:</span> ${refCount}</p>
          <p class="text-sm text-gray-500 truncate" title="${doc.path}"><span class="text-gray-600">Path:</span> ${doc.path}</p>
          <button class="view-adr-details mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium" data-id="${doc.id}">
            View Details <i class="fas fa-arrow-right ml-1"></i>
          </button>
        </div>
      </div>
    `;
  });
  
  adrsContainer.innerHTML = html;
  
  // Add event listeners to view details buttons
  document.querySelectorAll('.view-adr-details').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id');
      showAdrDetails(id);
    });
  });
  
  // Render pagination
  renderPagination(totalPages);
}

/**
 * Get filtered documents based on current filters
 */
function getFilteredDocuments() {
  if (!adrData || !adrData.documents) return [];
  
  // Get the current filter values
  const statusFilters = getStatusFilters();
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  // Filter documents
  return adrData.documents.filter(doc => {
    // Filter by status
    if (!statusFilters.includes(doc.status.toLowerCase())) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm && !matchesSearchTerm(doc, searchTerm)) {
      return false;
    }
    
    return true;
  });
}

/**
 * Render pagination controls
 */
function renderPagination(totalPages) {
  if (totalPages <= 1) {
    adrsPagination.innerHTML = '';
    return;
  }
  
  let html = '<div class="flex space-x-1">';
  
  // Previous button
  html += `
    <button class="pagination-button ${currentPage === 1 ? 'disabled' : ''}" 
            ${currentPage === 1 ? 'disabled' : ''} data-page="prev">
      <i class="fas fa-chevron-left"></i>
    </button>
  `;
  
  // Page buttons
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  // Adjust if we're near the end
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  // First page
  if (startPage > 1) {
    html += `<button class="pagination-button" data-page="1">1</button>`;
    if (startPage > 2) {
      html += `<span class="pagination-button disabled">...</span>`;
    }
  }
  
  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    html += `
      <button class="pagination-button ${i === currentPage ? 'active' : ''}" data-page="${i}">
        ${i}
      </button>
    `;
  }
  
  // Last page
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      html += `<span class="pagination-button disabled">...</span>`;
    }
    html += `<button class="pagination-button" data-page="${totalPages}">${totalPages}</button>`;
  }
  
  // Next button
  html += `
    <button class="pagination-button ${currentPage === totalPages ? 'disabled' : ''}" 
            ${currentPage === totalPages ? 'disabled' : ''} data-page="next">
      <i class="fas fa-chevron-right"></i>
    </button>
  `;
  
  html += '</div>';
  adrsPagination.innerHTML = html;
  
  // Add event listeners to pagination buttons
  document.querySelectorAll('.pagination-button:not(.disabled)').forEach(button => {
    button.addEventListener('click', () => {
      const page = button.getAttribute('data-page');
      
      if (page === 'prev') {
        currentPage--;
      } else if (page === 'next') {
        currentPage++;
      } else {
        currentPage = parseInt(page);
      }
      
      renderAdrDocuments();
      
      // Scroll to top of container
      adrsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/**
 * Show ADR details in a modal
 */
function showAdrDetails(id) {
  const doc = adrData.documents.find(d => d.id === id);
  if (!doc) return;
  
  const refCount = adrData.references.filter(ref => ref.id === id).length;
  const statusClass = getStatusClass(doc.status);
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.id = 'adrDetailsModal';
  
  let html = `
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
      <div class="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="font-bold text-xl">${doc.id} - ${doc.title}</h3>
        <button class="text-gray-500 hover:text-gray-700" id="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="p-4 overflow-y-auto flex-grow">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-gray-600 text-sm mb-1">Status</p>
            <p><span class="status-badge ${statusClass}">${doc.status}</span></p>
          </div>
          ${doc.date ? `
          <div>
            <p class="text-gray-600 text-sm mb-1">Date</p>
            <p>${doc.date}</p>
          </div>
          ` : ''}
        </div>
        
        ${doc.tags && doc.tags.length > 0 ? `
        <div class="mb-4">
          <p class="text-gray-600 text-sm mb-1">Tags</p>
          <div>${doc.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</div>
        </div>
        ` : ''}
        
        <div class="mb-4">
          <p class="text-gray-600 text-sm mb-1">Path</p>
          <p class="text-gray-800 break-words">${doc.path}</p>
        </div>
        
        <div class="mb-4">
          <p class="text-gray-600 text-sm mb-1">References in Code</p>
          <p>${refCount}</p>
        </div>
        
        <div class="border-t border-gray-200 pt-4 mt-4">
          <h4 class="font-semibold text-lg mb-2">References</h4>
          ${renderReferences(id)}
        </div>
      </div>
      <div class="p-4 border-t border-gray-200">
        <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md" id="closeModalBtn">
          Close
        </button>
      </div>
    </div>
  `;
  
  modal.innerHTML = html;
  modalContainer.appendChild(modal);
  
  // Add event listeners to close buttons
  document.getElementById('closeModal').addEventListener('click', () => {
    modalContainer.removeChild(modal);
  });
  
  document.getElementById('closeModalBtn').addEventListener('click', () => {
    modalContainer.removeChild(modal);
  });
  
  // Close when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modalContainer.removeChild(modal);
    }
  });
}

/**
 * Render references for an ADR
 */
function renderReferences(id) {
  const refs = adrData.references.filter(ref => ref.id === id);
  
  if (refs.length === 0) {
    return '<p class="text-gray-500">No references found</p>';
  }
  
  // Group references by file
  const fileMap = {};
  refs.forEach(ref => {
    if (!fileMap[ref.file]) {
      fileMap[ref.file] = [];
    }
    fileMap[ref.file].push(ref);
  });
  
  const files = Object.keys(fileMap).sort();
  
  let html = '<div class="space-y-4">';
  
  files.forEach(file => {
    const fileRefs = fileMap[file];
    
    html += `
      <div>
        <p class="font-medium">${getFileName(file)}</p>
        <p class="text-gray-500 text-sm mb-2">${file}</p>
        <table class="w-full text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="py-2 px-3 text-left">Line</th>
              <th class="py-2 px-3 text-left">Comment Type</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    fileRefs.forEach(ref => {
      html += `
        <tr class="border-b border-gray-200">
          <td class="py-2 px-3">${ref.line}</td>
          <td class="py-2 px-3"><code class="bg-gray-100 px-1 py-0.5 rounded">${formatCommentType(ref.commentType)}</code></td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}

/**
 * Render file explorer section
 */
function renderFileExplorer() {
  if (!adrData || !adrData.references || adrData.references.length === 0) {
    fileExplorer.innerHTML = '<p class="text-gray-500 text-center py-8">No files with ADR references</p>';
    return;
  }
  
  // Group references by file
  const fileMap = {};
  adrData.references.forEach(ref => {
    if (!fileMap[ref.file]) {
      fileMap[ref.file] = [];
    }
    fileMap[ref.file].push(ref);
  });
  
  const files = Object.keys(fileMap).sort();
  
  let html = '<div class="adr-card p-4">';
  
  files.forEach(file => {
    const refs = fileMap[file];
    const adrIds = [...new Set(refs.map(ref => ref.id))];
    
    html += `
      <div class="border-b border-gray-200 py-3 last:border-b-0">
        <div class="file-item" data-file="${file}">
          <div class="font-medium">${getFileName(file)}</div>
          <div class="text-gray-500 text-sm mb-1">${file}</div>
          <div>
            ${adrIds.map(id => `<span class="tag bg-blue-100 text-blue-800">${id}</span>`).join(' ')}
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  fileExplorer.innerHTML = html;
  
  // Add click event listeners to file items
  document.querySelectorAll('.file-item').forEach(item => {
    item.addEventListener('click', () => {
      const file = item.getAttribute('data-file');
      showFileDetails(file);
    });
  });
}

/**
 * Show file details when a file is clicked in the explorer
 */
function showFileDetails(file) {
  // Get references for this file
  const refs = adrData.references.filter(ref => ref.file === file);
  
  // Sort by line number
  refs.sort((a, b) => a.line - b.line);
  
  // Create a modal to show file details
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.id = 'fileDetailsModal';
  
  let html = `
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
      <div class="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 class="font-bold text-xl">${getFileName(file)}</h3>
        <button class="text-gray-500 hover:text-gray-700" id="closeFileModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="p-4 overflow-y-auto flex-grow">
        <p class="text-gray-500 mb-4">${file}</p>
        <h4 class="font-semibold text-lg mb-2">ADR References</h4>
        <table class="w-full">
          <thead class="bg-gray-100">
            <tr>
              <th class="py-2 px-3 text-left">Line</th>
              <th class="py-2 px-3 text-left">ADR ID</th>
              <th class="py-2 px-3 text-left">Comment Type</th>
            </tr>
          </thead>
          <tbody>
  `;
  
  refs.forEach(ref => {
    html += `
      <tr class="border-b border-gray-200">
        <td class="py-2 px-3">${ref.line}</td>
        <td class="py-2 px-3">
          <a href="#" class="text-blue-600 hover:text-blue-800 adr-link" data-id="${ref.id}">
            ${ref.id}
          </a>
        </td>
        <td class="py-2 px-3"><code class="bg-gray-100 px-1 py-0.5 rounded">${formatCommentType(ref.commentType)}</code></td>
      </tr>
    `;
  });
  
  html += `
          </tbody>
        </table>
      </div>
      <div class="p-4 border-t border-gray-200">
        <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md" id="closeFileModalBtn">
          Close
        </button>
      </div>
    </div>
  `;
  
  modal.innerHTML = html;
  modalContainer.appendChild(modal);
  
  // Add event listeners to close buttons
  document.getElementById('closeFileModal').addEventListener('click', () => {
    modalContainer.removeChild(modal);
  });
  
  document.getElementById('closeFileModalBtn').addEventListener('click', () => {
    modalContainer.removeChild(modal);
  });
  
  // Add event listeners to ADR links
  document.querySelectorAll('.adr-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.getAttribute('data-id');
      modalContainer.removeChild(modal);
      activateTab('adrs-tab');
      highlightAdr(id);
    });
  });
  
  // Close when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modalContainer.removeChild(modal);
    }
  });
}

/**
 * Apply filters to the ADR documents
 */
function applyFilters() {
  currentPage = 1; // Reset to first page when filters change
  renderAdrDocuments();
}

/**
 * Get the current status filter values
 */
function getStatusFilters() {
  const statusFilters = [];
  
  if (document.getElementById('statusAccepted').checked) {
    statusFilters.push('accepted');
  }
  
  if (document.getElementById('statusProposed').checked) {
    statusFilters.push('proposed');
  }
  
  if (document.getElementById('statusRejected').checked) {
    statusFilters.push('rejected');
  }
  
  if (document.getElementById('statusDeprecated').checked) {
    statusFilters.push('deprecated');
  }
  
  // Always include 'unknown' status
  statusFilters.push('unknown');
  
  return statusFilters;
}

/**
 * Check if an ADR document matches the search term
 */
function matchesSearchTerm(doc, term) {
  return (
    doc.id.toLowerCase().includes(term) ||
    doc.title.toLowerCase().includes(term) ||
    (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(term)))
  );
}

/**
 * Get the status class for a given status
 */
function getStatusClass(status) {
  switch (status.toLowerCase()) {
    case 'accepted':
      return 'status-accepted';
    case 'rejected':
      return 'status-rejected';
    case 'deprecated':
      return 'status-deprecated';
    case 'proposed':
      return 'status-proposed';
    default:
      return 'status-unknown';
  }
}

/**
 * Get the file name from a file path
 */
function getFileName(filePath) {
  return filePath.split('/').pop();
}

/**
 * Format the comment type for display
 */
function formatCommentType(commentType) {
  return commentType
    .replace(/\\/g, '')
    .replace(/\/\//g, '// ')
    .replace(/\/\*/g, '/* ')
    .replace(/\*\//g, ' */')
    .replace(/\*/g, '*');
}

/**
 * Debounce function to limit how often a function is called
 */
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
