import React, { useState, useEffect } from 'react';

function FormulationLeftPanel({ onRun, loading }) {
  const [selectedProteins, setSelectedProteins] = useState([]);
  const [availableProteinFiles, setAvailableProteinFiles] = useState([]);

  useEffect(() => {
    // In a real application, you might fetch this list from a backend API.
    // For this example, we'll use the list we discovered via glob.
    const pdbFiles = [
      "C8.pdb",
      "C10.pdb",
      "C12.pdb",
    ];
    setAvailableProteinFiles(pdbFiles);
  }, []);

  const handleProteinChange = (protein) => {
    setSelectedProteins(prev => {
      // If the clicked protein is already selected, deselect it.
      if (prev === protein) {
        onRun(null); // Run with null to clear results
        return null;
      } else {
        // Otherwise, select the new protein.
        onRun([protein]); // Run with the newly selected protein
        return protein;
      }
    });
  };

  // No handleRunClick needed anymore as selection triggers onRun

  return (
    <div style={{paddingTop: 0}} className="left-panel">
      <div className="floating-section" style={{ marginBottom: '10px', paddingBottom: 5, paddingTop: 20}}>
        <h2 style={{ marginBottom: 10 }}>Coconut Oil</h2>
        <div style={{ marginTop: 10 }}>
          {availableProteinFiles.map((protein) => (
            <div key={protein} className="bioactivity-line">
              <div className="select-container">
                <div>
                  <input
                    type="checkbox"
                    id={protein}
                    checked={selectedProteins === protein}
                    onChange={() => handleProteinChange(protein)}
                  />
                  <label htmlFor={protein}>{protein.replace('.pdb', '')}</label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FormulationLeftPanel;