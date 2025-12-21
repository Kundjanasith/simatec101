import React, { useState } from 'react';

const proteinFiles = [
  "(MungBean)_8Sa-globulin_MUB2.pdb",
  "(MungBean)_8Sa-globulin_MUBRV.pdb",
  "(MungBean)_8Sa-globulin_NAGNAM.pdb",
  "(MungBean)_8Sa-globulin_SRRP5.pdb",
  "(Pea)_7S-globulin_MUB2.pdb",
  "(Pea)_7S-globulin_MUBRV.pdb",
  "(Pea)_7S-globulin_NAGNAM.pdb",
  "(Pea)_7S-globulin_SRRP5.pdb",
  "(Soybean)_11S-legumin_MUB2.pdb",
  "(Soybean)_11S-legumin_MUBRV.pdb",
  "(Soybean)_11S-legumin_SRRP5.pdb",
  "(Whey)_B-lactoglobulin_MUB2.pdb",
  "(Whey)_B-lactoglobulin_MUBRV.pdb",
  "(Whey)_B-lactoglobulin_NAGNAM.pdb",
  "(Whey)_B-lactoglobulin_SRRP5.pdb"
];

function MembraneLeftPanel({ onRun, loading }) {
  const [selectedProtein, setSelectedProtein] = useState(null);

  const handleProteinChange = (protein) => {
    setSelectedProtein(prev => {
      let newSelection = null;
      if (prev === protein) {
        // Deselect if already selected
        newSelection = null;
        onRun([]);
      } else {
        // Select new protein
        newSelection = protein;
        onRun([protein]);
      }
      return newSelection;
    });
  };

  

  return (
    <div style={{paddingTop: 0}} className="left-panel">
      <div className="floating-section" style={{ marginBottom: '10px', paddingBottom: 5, paddingTop: 20}}>
        <h2 style={{ marginBottom: 10 }}>Proteins</h2>
        <div style={{ marginTop: 10 }}>
          {proteinFiles.map((protein) => (
            <div key={protein} className="bioactivity-line">
              <div className="select-container">
                <div>
                  <input
                    type="checkbox"
                    id={protein}
                    checked={selectedProtein === protein}
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

export default MembraneLeftPanel;