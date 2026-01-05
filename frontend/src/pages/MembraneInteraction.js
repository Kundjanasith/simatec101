import React, { useState } from 'react';
import MembraneLeftPanel from '../components/MembraneLeftPanel';
import ViewerMembrane from '../components/ViewerMembrane';
import MembraneResultsPanel from '../components/MembraneResultsPanel';

import '../App.css';

function MembraneInteraction() {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedProteins, setSelectedProteins] = useState([]);

  const handleRun = (proteins) => {
    setLoading(true); // Keep loading true while processing
    setSelectedFiles(proteins.map(p => `/a3/${p}`));
    setSelectedProteins(proteins);
    setLoading(false); // Set loading false immediately after processing
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
        <ViewerMembrane ligandFiles={selectedFiles} />
        <MembraneResultsPanel selectedProteins={selectedProteins} />
      </div>
      </div>
  );
}

export default MembraneInteraction;
