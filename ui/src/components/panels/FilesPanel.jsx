import React from 'react';
import { useAdrData } from '../../context/AdrDataContext';
import { FiFile, FiArrowRight } from 'react-icons/fi';
import { useModal } from '../Modal';

const FilesPanel = () => {
  const { getFilesWithReferences, getReferencesForFile } = useAdrData();
  const { openModal } = useModal();
  
  const filesWithReferences = getFilesWithReferences();
  
  if (filesWithReferences.length === 0) {
    return (
      <div className="text-center py-12">
        <FiFile className="mx-auto text-4xl text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Files With References</h3>
        <p className="text-gray-500">No source files with ADR references were found</p>
      </div>
    );
  }

  const showFileDetails = (file) => {
    // Get references for this file
    const refs = getReferencesForFile(file);
    
    // Sort by line number
    refs.sort((a, b) => a.line - b.line);
    
    openModal({
      title: getFileName(file),
      content: (
        <div>
          <p className="text-gray-500 mb-4">{file}</p>
          <h4 className="font-semibold text-lg mb-2">ADR References</h4>
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-3 text-left">Line</th>
                <th className="py-2 px-3 text-left">ADR ID</th>
                <th className="py-2 px-3 text-left">Comment Type</th>
              </tr>
            </thead>
            <tbody>
              {refs.map((ref, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2 px-3">{ref.line}</td>
                  <td className="py-2 px-3">
                    <button 
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => showAdrDetails(ref.id)}
                    >
                      {ref.id}
                    </button>
                  </td>
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
      ),
      size: 'lg'
    });
  };

  const showAdrDetails = (id) => {
    // This function would be similar to the one in AdrsPanel
    // For brevity, we're just showing a simplified version
    const { adrData, getReferencesForAdr } = useAdrData();
    const doc = adrData.documents.find(d => d.id === id);
    
    if (!doc) return;
    
    const references = getReferencesForAdr(id);
    
    openModal({
      title: `${doc.id} - ${doc.title}`,
      content: (
        <div>
          <div className="flex items-center mb-2">
            <span className="text-sm text-gray-600 mr-2">Status:</span>
            <span className={`status-badge status-${doc.status.toLowerCase()}`}>{doc.status}</span>
          </div>
          <p className="text-sm mb-2">
            <span className="text-gray-600">References:</span> {references.length}
          </p>
          <p className="text-sm text-gray-500">
            <span className="text-gray-600">Path:</span> {doc.path}
          </p>
        </div>
      )
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {filesWithReferences.map((fileData, index) => {
        const { file, references } = fileData;
        const adrIds = [...new Set(references.map(ref => ref.id))];
        
        return (
          <div 
            key={file}
            className={`border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer p-4`}
            onClick={() => showFileDetails(file)}
          >
            <div className="font-medium">{getFileName(file)}</div>
            <div className="text-gray-500 text-sm mb-1">{file}</div>
            <div className="flex flex-wrap gap-1">
              {adrIds.map(id => (
                <span key={id} className="tag bg-blue-100 text-blue-800">{id}</span>
              ))}
            </div>
            <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
              View Details <FiArrowRight className="ml-1" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

// Helper function to get file name from path
const getFileName = (filePath) => {
  return filePath.split('/').pop();
};

// Helper function to format comment type
const formatCommentType = (commentType) => {
  return commentType
    .replace(/\\/g, '')
    .replace(/\/\//g, '// ')
    .replace(/\/\*/g, '/* ')
    .replace(/\*\//g, ' */')
    .replace(/\*/g, '*');
};

export default FilesPanel;
