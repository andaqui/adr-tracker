import React from 'react';
import { useAdrData } from '../../context/AdrDataContext';
import { FiAlertCircle, FiAlertTriangle } from 'react-icons/fi';

const IssuesPanel = () => {
  const { getIssuesByType, setActiveTab } = useAdrData();
  
  const issuesByType = getIssuesByType();
  
  if (Object.keys(issuesByType).length === 0) {
    return (
      <div className="text-center py-12">
        <FiAlertCircle className="mx-auto text-4xl text-green-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Issues Found</h3>
        <p className="text-gray-500">All ADR documents are properly referenced</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Missing documents */}
      {issuesByType.missing_document && (
        <IssueSection 
          title="Missing ADR Documents" 
          count={issuesByType.missing_document.length}
          icon={<FiAlertCircle className="text-red-500" />}
          type="error"
        >
          {issuesByType.missing_document.map((issue, index) => (
            <div key={index} className="issue-item issue-error">
              <strong>{issue.adrId}</strong> referenced in {issue.file}:{issue.line}
            </div>
          ))}
        </IssueSection>
      )}
      
      {/* Unused documents */}
      {issuesByType.unused_document && (
        <IssueSection 
          title="Unused ADR Documents" 
          count={issuesByType.unused_document.length}
          icon={<FiAlertTriangle className="text-yellow-500" />}
          type="warning"
        >
          {issuesByType.unused_document.map((issue, index) => (
            <div key={index} className="issue-item issue-warning">
              <strong>{issue.adrId}</strong> is not referenced in any source file
            </div>
          ))}
        </IssueSection>
      )}
      
      {/* Conflicting references */}
      {issuesByType.conflicting_reference && (
        <IssueSection 
          title="Conflicting ADR References" 
          count={issuesByType.conflicting_reference.length}
          icon={<FiAlertCircle className="text-red-500" />}
          type="error"
        >
          {issuesByType.conflicting_reference.map((issue, index) => (
            <div key={index} className="issue-item issue-error">
              Multiple ADRs referenced at {issue.file}:{issue.line}: {issue.message}
            </div>
          ))}
        </IssueSection>
      )}
      
      {/* Other issues */}
      {(() => {
        const otherTypes = Object.keys(issuesByType).filter(type => 
          !['missing_document', 'unused_document', 'conflicting_reference'].includes(type)
        );
        
        if (otherTypes.length > 0) {
          const otherIssues = otherTypes.flatMap(type => issuesByType[type]);
          
          return (
            <IssueSection 
              title="Other Issues" 
              count={otherIssues.length}
              icon={<FiAlertTriangle className="text-yellow-500" />}
              type="warning"
            >
              {otherIssues.map((issue, index) => (
                <div key={index} className="issue-item issue-warning">
                  {issue.message}
                  {issue.file ? ` in ${issue.file}` : ''}
                  {issue.line ? `:${issue.line}` : ''}
                </div>
              ))}
            </IssueSection>
          );
        }
        return null;
      })()}
    </div>
  );
};

// Issue Section Component
const IssueSection = ({ title, count, icon, children, type }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center">
        <div className="mr-2">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-700">
          {title} ({count})
        </h3>
      </div>
      <div className="p-4 space-y-2">
        {children}
      </div>
    </div>
  );
};

export default IssuesPanel;
