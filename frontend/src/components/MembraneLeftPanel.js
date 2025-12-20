import React, { useState } from 'react';

const proteinFiles = [
  "(Mung bean)_8Sα-globulin_MUB2.pdb",
  "(Mung bean)_8Sα-globulin_MUBRV.pdb",
  "(Mung bean)_8Sα-globulin_NAGNAM.pdb",
  "(Mung bean)_8Sα-globulin_SRRP5.pdb",
  "(Pea)_7S-globulin_MUB2.pdb",
  "(Pea)_7S-globulin_MUBRV.pdb",
  "(Pea)_7S-globulin_NAGNAM.pdb",
  "(Pea)_7S-globulin_SRRP5.pdb",
  "(Soybean)_11S-legumin_MUB2.pdb",
  "(Soybean)_11S-legumin_MUBRV.pdb",
  "(Soybean)_11S-legumin_SRRP5.pdb",
  "(Whey)_β-lactoglobulin_MUB2.pdb",
  "(Whey)_β-lactoglobulin_MUBRV.pdb",
  "(Whey)_β-lactoglobulin_NAGNAM.pdb",
  "(Whey)_β-lactoglobulin_SRRP5.pdb"
];

function MembraneLeftPanel({ onRun, loading }) {
  const [selectedProteins, setSelectedProteins] = useState([]);

  const handleProteinChange = (protein) => {
    setSelectedProteins(prev => {
      const isSelected = prev.includes(protein);
      if (isSelected) {
        return prev.filter(p => p !== protein);
      } else {
        return [...prev, protein];
      }
    });
  };

  const handleRunClick = () => {
    if (selectedProteins.length === 0) {
      alert('Please select at least one protein.');
      return;
    }
    onRun(selectedProteins);
  };

  return (
    <div style={{paddingTop: 0}} className="left-panel">
      <div className="floating-section" style={{ marginBottom: '10px', paddingBottom: 5, paddingTop: 5}}>
        <h2 style={{ marginBottom: 0 }}>Protein Selection</h2>
        <div style={{ marginTop: 0 }}>
          {proteinFiles.map((protein) => (
            <div key={protein} className="bioactivity-line">
              <div className="select-container">
                <div>
                  <input
                    type="checkbox"
                    id={protein}
                    checked={selectedProteins.includes(protein)}
                    onChange={() => handleProteinChange(protein)}
                  />
                  <label htmlFor={protein}>{protein.replace('.pdb', '')}</label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button onClick={handleRunClick} disabled={loading || selectedProteins.length === 0}>
        {loading ? 'Running...' : 'Run'}
      </button>
    </div>
  );
}

export default MembraneLeftPanel;