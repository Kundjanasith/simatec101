import React, { useState } from 'react';
import MembraneLeftPanel from '../components/MembraneLeftPanel';
import Viewer from '../components/Viewer';

import '../App.css';

function MembraneInteraction() {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleRun = (selectedProteins) => {
    setLoading(true);
    // Simulate a process
    setTimeout(() => {
      setSelectedFiles(selectedProteins.map(p => `/a3/${p}`));
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="App">
      <div style={{ textAlign: 'center', marginLeft: '2rem', marginTop: 0, paddingTop: 0, marginBottom: 10, paddingBottom: 0}}>
        <p style={{ fontSize: '2rem', color: 'white', marginTop: 0, paddingTop: 0, marginBottom: 0, fontWeight: 'bold' }}>
          Membrane Interaction Service
        </p>
      </div>
      <div style={{marginTop: 0, paddingTop: 0}} className="main-content">
        <MembraneLeftPanel onRun={handleRun} loading={loading} />
        <Viewer ligandFiles={selectedFiles} />
      </div>
      </div>
  );
}

export default MembraneInteraction;
