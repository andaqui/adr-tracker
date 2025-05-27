import React from 'react';
import { useAdrData } from '../context/AdrDataContext';
import { FiPieChart, FiFileText, FiAlertTriangle, FiFolder } from 'react-icons/fi';

const TabNavigation = () => {
  const { activeTab, setActiveTab } = useAdrData();

  const tabs = [
    { id: 'summary', label: 'Summary', icon: <FiPieChart className="mr-2" /> },
    { id: 'adrs', label: 'ADR Documents', icon: <FiFileText className="mr-2" /> },
    { id: 'issues', label: 'Issues', icon: <FiAlertTriangle className="mr-2" /> },
    { id: 'files', label: 'Files', icon: <FiFolder className="mr-2" /> }
  ];

  return (
    <div className="mb-6 border-b border-gray-200">
      <ul className="flex flex-wrap -mb-px">
        {tabs.map(tab => (
          <li key={tab.id} className="mr-2" role="presentation">
            <button
              className={`inline-block py-2 px-4 flex items-center ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-blue-600 hover:border-b-2 hover:border-blue-600'
              }`}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
            >
              {tab.icon}
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TabNavigation;
