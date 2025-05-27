import React from 'react';
import { useAdrData } from './context/AdrDataContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Placeholder from './components/Placeholder';
import Dashboard from './components/Dashboard';
import { ModalProvider } from './components/Modal';

function App() {
  const { adrData, loading, error } = useAdrData();

  return (
    <ModalProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <Header />
        
        <main className="container mx-auto px-4 py-6 flex-grow">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          ) : adrData ? (
            <Dashboard />
          ) : (
            <Placeholder />
          )}
        </main>
        
        <Footer />
      </div>
    </ModalProvider>
  );
}

export default App;
