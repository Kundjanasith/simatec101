import React, { useState } from 'react';
import { proteinGroups, proteinNameMapping } from './proteinData';

function MembraneLeftPanel({ onRun, loading }) {
  const [selectedProteins, setSelectedProteins] = useState([]);

  const handleProteinChange = (protein) => {
    const newSelection = selectedProteins.includes(protein)
      ? selectedProteins.filter(p => p !== protein)
      : [...selectedProteins, protein];
    
    setSelectedProteins(newSelection);
    onRun(newSelection);
  };

  return (
    <div style={{paddingTop: 0}} className="left-panel">
      <div className="floating-section" style={{ marginBottom: '10px', paddingBottom: 5, paddingTop: 20}}>
        <h2 style={{ marginBottom: 10 }}>Proteins</h2>
        <div style={{ marginTop: 10 }}>
          {Object.keys(proteinGroups).map(groupName => (
            <div key={groupName} style={{ marginBottom: '10px' }}>
              <h3 style={{ marginBottom: '5px' }}>
                {groupName}
              </h3>
              <div style={{ paddingLeft: '20px' }}>
                {proteinGroups[groupName].map((protein) => (
                  <div key={protein} className="bioactivity-line">
                    <div className="select-container">
                      <div>
                        <input
                          type="checkbox"
                          id={protein}
                          checked={selectedProteins.includes(protein)}
                          onChange={() => handleProteinChange(protein)}
                        />
                        <label htmlFor={protein}>{proteinNameMapping[protein]}</label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MembraneLeftPanel;