import React from 'react';
import { useAdrData } from '../../context/AdrDataContext';
import { FiArrowRight } from 'react-icons/fi';

const SummaryPanel = () => {
  const { 
    adrData, 
    setActiveTab, 
    getStatusDistribution, 
    getIssuesByType 
  } = useAdrData();

  if (!adrData) return null;

  const statusDistribution = getStatusDistribution();
  const issuesByType = getIssuesByType();
  
  // Count missing ADR documents
  const missingAdrCount = adrData.issues.filter(
    issue => issue.type === 'missing_document'
  ).length;

  // Get the first 5 issues for the summary
  const recentIssues = adrData.issues.slice(0, 5);

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total ADRs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total ADRs</h3>
          <p className="text-3xl font-bold text-blue-600">{adrData.documents.length}</p>
        </div>
        
        {/* Total References */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">References</h3>
          <p className="text-3xl font-bold text-green-600">{adrData.references.length}</p>
        </div>
        
        {/* Total Issues */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Issues</h3>
          <p className="text-3xl font-bold text-red-600">{adrData.issues.length}</p>
        </div>
        
        {/* Missing ADRs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Missing ADRs</h3>
          <p className="text-3xl font-bold text-orange-600">{missingAdrCount}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Issues */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Issues</h3>
          <div className="max-h-80 overflow-y-auto">
            {recentIssues.length > 0 ? (
              recentIssues.map((issue, index) => {
                const issueClass = issue.type === 'missing_document' || issue.type === 'conflicting_reference' 
                  ? 'issue-error' 
                  : 'issue-warning';
                
                let issueText = '';
                if (issue.type === 'missing_document') {
                  issueText = <><strong>{issue.adrId}</strong> referenced in {issue.file}:{issue.line}</>;
                } else if (issue.type === 'unused_document') {
                  issueText = <><strong>{issue.adrId}</strong> is not referenced in any source file</>;
                } else if (issue.type === 'conflicting_reference') {
                  issueText = <>Multiple ADRs referenced at {issue.file}:{issue.line}: {issue.message}</>;
                } else {
                  issueText = <>{issue.message}{issue.file ? ` in ${issue.file}` : ''}{issue.line ? `:${issue.line}` : ''}</>;
                }
                
                return (
                  <div key={index} className={`issue-item ${issueClass} mb-2`}>
                    {issueText}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">No issues found</p>
            )}
          </div>
          <div className="mt-4 text-right">
            <button 
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center ml-auto"
              onClick={() => setActiveTab('issues')}
            >
              View all issues <FiArrowRight className="ml-1" />
            </button>
          </div>
        </div>
        
        {/* ADR Status Distribution */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">ADR Status Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-adr-accepted mr-2"></div>
                <span className="text-sm">Accepted: <span className="font-semibold">{statusDistribution.accepted}</span></span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-adr-proposed mr-2"></div>
                <span className="text-sm">Proposed: <span className="font-semibold">{statusDistribution.proposed}</span></span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-adr-rejected mr-2"></div>
                <span className="text-sm">Rejected: <span className="font-semibold">{statusDistribution.rejected}</span></span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-adr-deprecated mr-2"></div>
                <span className="text-sm">Deprecated: <span className="font-semibold">{statusDistribution.deprecated}</span></span>
              </div>
              {statusDistribution.unknown > 0 && (
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-adr-unknown mr-2"></div>
                  <span className="text-sm">Unknown: <span className="font-semibold">{statusDistribution.unknown}</span></span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryPanel;
