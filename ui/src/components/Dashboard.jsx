import React from 'react';
import { useAdrData } from '../context/AdrDataContext';
import TabNavigation from './TabNavigation';
import SummaryPanel from './panels/SummaryPanel';
import AdrsPanel from './panels/AdrsPanel';
import IssuesPanel from './panels/IssuesPanel';
import FilesPanel from './panels/FilesPanel';
import Modal from './Modal';

const Dashboard = () => {
  const { activeTab } = useAdrData();

  return (
    <div className="dashboard">
      <TabNavigation />
      
      <div className="tab-content mt-6">
        {activeTab === 'summary' && <SummaryPanel />}
        {activeTab === 'adrs' && <AdrsPanel />}
        {activeTab === 'issues' && <IssuesPanel />}
        {activeTab === 'files' && <FilesPanel />}
      </div>
      
      {/* Modal container for dynamic modals */}
      <Modal />
    </div>
  );
};

export default Dashboard;
