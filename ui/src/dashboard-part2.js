/**
 * Render summary issues
 */
function renderSummaryIssues() {
  if (!adrData || !adrData.issues || adrData.issues.length === 0) {
    summaryIssuesContainer.innerHTML = '<p class="text-gray-500">No issues found</p>';
    return;
  }
  
  // Show only the first 5 issues in the summary
  const recentIssues = adrData.issues.slice(0, 5);
  
  let html = '';
  
  recentIssues.forEach(issue => {
    const issueClass = issue.type === 'missing_document' || issue.type === 'conflicting_reference' 
      ? 'issue-error' 
      : 'issue-warning';
    
    let issueText = '';
    if (issue.type === 'missing_document') {
      issueText = `<strong>${issue.adrId}</strong> referenced in ${issue.file}:${issue.line}`;
    } else if (issue.type === 'unused_document') {
      issueText = `<strong>${issue.adrId}</strong> is not referenced in any source file`;
    } else if (issue.type === 'conflicting_reference') {
      issueText = `Multiple ADRs referenced at ${issue.file}:${issue.line}: ${issue.message}`;
    } else {
      issueText = `${issue.message}${issue.file ? ` in ${issue.file}` : ''}${issue.line ? `:${issue.line}` : ''}`;
    }
    
    html += `
      <div class="issue-item ${issueClass} mb-2">
        ${issueText}
      </div>
    `;
  });
  
  summaryIssuesContainer.innerHTML = html;
}

/**
 * Render issues section
 */
function renderIssues() {
  if (!adrData || !adrData.issues || adrData.issues.length === 0) {
    issuesContainer.innerHTML = '<p class="text-gray-500 text-center py-8">No issues found</p>';
    return;
  }
  
  // Group issues by type
  const issuesByType = {};
  adrData.issues.forEach(issue => {
    if (!issuesByType[issue.type]) {
      issuesByType[issue.type] = [];
    }
    issuesByType[issue.type].push(issue);
  });
  
  let html = '';
  
  // Missing documents
  if (issuesByType.missing_document) {
    html += `
      <div class="adr-card p-4 mb-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">
          <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
          Missing ADR Documents (${issuesByType.missing_document.length})
        </h3>
        <div class="space-y-2">
    `;
    
    issuesByType.missing_document.forEach(issue => {
      html += `
        <div class="issue-item issue-error">
          <strong>${issue.adrId}</strong> referenced in ${issue.file}:${issue.line}
        </div>
      `;
    });
    
    html += '</div></div>';
  }
  
  // Unused documents
  if (issuesByType.unused_document) {
    html += `
      <div class="adr-card p-4 mb-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">
          <i class="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
          Unused ADR Documents (${issuesByType.unused_document.length})
        </h3>
        <div class="space-y-2">
    `;
    
    issuesByType.unused_document.forEach(issue => {
      html += `
        <div class="issue-item issue-warning">
          <strong>${issue.adrId}</strong> is not referenced in any source file
        </div>
      `;
    });
    
    html += '</div></div>';
  }
  
  // Conflicting references
  if (issuesByType.conflicting_reference) {
    html += `
      <div class="adr-card p-4 mb-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">
          <i class="fas fa-exclamation-circle text-red-500 mr-2"></i>
          Conflicting ADR References (${issuesByType.conflicting_reference.length})
        </h3>
        <div class="space-y-2">
    `;
    
    issuesByType.conflicting_reference.forEach(issue => {
      html += `
        <div class="issue-item issue-error">
          Multiple ADRs referenced at ${issue.file}:${issue.line}: ${issue.message}
        </div>
      `;
    });
    
    html += '</div></div>';
  }
  
  // Other issues
  const otherTypes = Object.keys(issuesByType).filter(type => 
    !['missing_document', 'unused_document', 'conflicting_reference'].includes(type)
  );
  
  if (otherTypes.length > 0) {
    const otherIssues = otherTypes.flatMap(type => issuesByType[type]);
    
    html += `
      <div class="adr-card p-4 mb-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">
          <i class="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
          Other Issues (${otherIssues.length})
        </h3>
        <div class="space-y-2">
    `;
    
    otherIssues.forEach(issue => {
      html += `
        <div class="issue-item issue-warning">
          ${issue.message}${issue.file ? ` in ${issue.file}` : ''}${issue.line ? `:${issue.line}` : ''}
        </div>
      `;
    });
    
    html += '</div></div>';
  }
  
  issuesContainer.innerHTML = html;
}

/**
 * Handle search input
 */
function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  
  if (!searchTerm) {
    searchResults.classList.add('hidden');
    return;
  }
  
  if (!adrData || !adrData.documents) {
    return;
  }
  
  // Filter documents by search term
  const matchingDocs = adrData.documents.filter(doc => 
    doc.id.toLowerCase().includes(searchTerm) ||
    doc.title.toLowerCase().includes(searchTerm) ||
    (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
  );
  
  if (matchingDocs.length === 0) {
    searchResults.innerHTML = '<div class="p-3 text-gray-500">No matching ADRs found</div>';
    searchResults.classList.remove('hidden');
    return;
  }
  
  // Show at most 5 results in the dropdown
  const resultsToShow = matchingDocs.slice(0, 5);
  
  let html = '';
  
  resultsToShow.forEach(doc => {
    const statusClass = getStatusClass(doc.status);
    
    html += `
      <div class="p-3 hover:bg-gray-100 cursor-pointer search-result" data-id="${doc.id}">
        <div class="font-medium">${doc.id} - ${doc.title}</div>
        <div class="text-sm text-gray-500 flex items-center">
          <span class="status-badge ${statusClass} mr-2">${doc.status}</span>
          ${doc.tags && doc.tags.length > 0 ? 
            `<span class="text-xs text-gray-500">${doc.tags.join(', ')}</span>` : ''}
        </div>
      </div>
    `;
  });
  
  searchResults.innerHTML = html;
  searchResults.classList.remove('hidden');
  
  // Add click event to search results
  document.querySelectorAll('.search-result').forEach(result => {
    result.addEventListener('click', () => {
      const id = result.getAttribute('data-id');
      // Find the document
      const doc = adrData.documents.find(d => d.id === id);
      if (doc) {
        // Switch to ADRs tab
        activateTab('adrs-tab');
        // Highlight the selected ADR
        highlightAdr(id);
      }
      searchResults.classList.add('hidden');
      searchInput.value = '';
    });
  });
  
  // Close search results when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.add('hidden');
    }
  });
}
