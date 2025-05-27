/**
 * Main App component
 * @adr ADR-0002
 */
import React, { useState, useEffect } from 'react';

// ADR-0002: Using React functional components with hooks
const App: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch data from API
    fetch('/api/data')
      .then(response => response.json())
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="app-container">
      <header>
        <h1>Example App</h1>
      </header>
      <main>
        {loading ? (
          <p>Loading data...</p>
        ) : (
          <ul>
            {data.map(item => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        )}
      </main>
      {/* ADR-0002: Using React for component-based UI */}
      <footer>
        <p>&copy; 2025 Example App</p>
      </footer>
    </div>
  );
};

export default App;
