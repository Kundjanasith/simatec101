import React, { useState, useEffect } from 'react';
import axios from 'axios';

function LeftPanel({ onRunDocking, loading }) {
  const [bioactivities, setBioactivities] = useState({});
  const [selectedProtein, setSelectedProtein] = useState(null); // { category: "A.Anti-inflammation", protein: "COX-2.pdbqt" }
  const [selectedLigands, setSelectedLigands] = useState({}); // { "A.Anti-inflammation": ["Curcumin.pdbqt", "Oryzanol.pdbqt"] }

  useEffect(() => {
    axios.get(process.env.PUBLIC_URL + '/mapping_contnet.json')
      .then(response => {
        setBioactivities(response.data);
      })
      .catch(error => {
        console.error('Error fetching mapping content:', error);
      });
  }, []);

  const handleProteinChange = (category, protein) => {
    if (selectedProtein && selectedProtein.category === category && selectedProtein.protein === protein) {
      // Deselect if already selected
      setSelectedProtein(null);
      setSelectedLigands(prev => {
        const newLigands = { ...prev };
        delete newLigands[category];
        return newLigands;
      });
    } else {
      // Select new protein and clear ligands for other categories
      setSelectedProtein({ category, protein });
      setSelectedLigands(prev => {
        const newLigands = {};
        if (prev[category]) {
          newLigands[category] = prev[category]; // Keep ligands for the newly selected category
        }
        return newLigands;
      });
    }
  };

  const handleLigandChange = (category, ligand) => {
    setSelectedLigands(prev => {
      const currentCategoryLigands = prev[category] || [];
      const isSelected = currentCategoryLigands.includes(ligand);
      let newCategoryLigands;

      if (isSelected) {
        newCategoryLigands = currentCategoryLigands.filter(l => l !== ligand);
      } else {
        if (currentCategoryLigands.length < 2) {
          newCategoryLigands = [...currentCategoryLigands, ligand];
        } else {
          newCategoryLigands = currentCategoryLigands; // Do not add if already 2 selected
        }
      }

      return {
        ...prev,
        [category]: newCategoryLigands,
      };
    });
  };

  const handleRunClick = () => {
    if (!selectedProtein || !selectedLigands[selectedProtein.category] || selectedLigands[selectedProtein.category].length === 0) {
      alert('Please select a protein and at least one ligand.');
      return;
    }

    const proteinFile = selectedProtein.protein;
    const ligandsToDock = selectedLigands[selectedProtein.category];
    
    // Create a single docking request with all selected ligands
    const dockingRequest = {
      receptor: proteinFile,
      ligands: ligandsToDock
    };

    console.log("LeftPanel: Calling onRunDocking with request:", dockingRequest);
    onRunDocking([dockingRequest], selectedProtein); // Pass selectedProtein to App.js
  };

  return (
    <div style={{paddingTop: 0}} className="left-panel">
      <div className="floating-section" style={{ marginBottom: '10px', paddingBottom: 5, paddingTop: 5}}>
        <h2 style={{ marginBottom: 0 }}>Bioactivity Testing</h2>
        <div style={{ marginTop: 0 }}>
          {Object.entries(bioactivities).map(([category, data]) => (
            <div key={category}  style={{ paddingBottom: 0 }} className="bioactivity-line">
              <strong>{category}</strong>
              <div className="select-container">
                {Array.isArray(data.protein) ? (
                  data.protein.map(protein => (
                    <div key={protein}>
                      <input
                        type="checkbox"
                        id={`${category}-${protein}`}
                        checked={selectedProtein && selectedProtein.category === category && selectedProtein.protein === protein}
                        onChange={() => handleProteinChange(category, protein)}
                      />
                      <label htmlFor={`${category}-${protein}`}>{protein.replace('.pdbqt', '')}</label>
                    </div>
                  ))
                ) : (
                  <div>
                    <input
                      type="checkbox"
                      id={`${category}-${data.protein}`}
                      checked={selectedProtein && selectedProtein.category === category && selectedProtein.protein === data.protein}
                      onChange={() => handleProteinChange(category, data.protein)}
                    />
                    <label htmlFor={`${category}-${data.protein}`}>{data.protein.replace('.pdbqt', '')}</label>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="floating-section" style={{ marginBottom: 0, paddingBottom: 5, paddingTop: 5}}>
        <h2 style={{ marginBottom: 0 }}>Bioactive Compounds</h2>
        <div style={{ marginTop: 0 }}>
          {Object.entries(bioactivities).map(([category, data]) => (
            <div key={category} style={{ paddingBottom: 0 }} className="bioactivity-line">
              <strong >{category}</strong>
              <div  className="select-container">
                {data.ligands.map(ligand => (
                  <div key={ligand}>
                    <input
                      type="checkbox"
                      id={`${category}-${ligand}`}
                      checked={(selectedLigands[category] || []).includes(ligand)}
                      onChange={() => handleLigandChange(category, ligand)}
                      disabled={!selectedProtein || selectedProtein.category !== category}
                    />
                    <label htmlFor={`${category}-${ligand}`}>{ligand.replace('.pdbqt', '')}</label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleRunClick} disabled={loading || !selectedProtein || !selectedLigands[selectedProtein.category] || selectedLigands[selectedProtein.category].length === 0}>
        {loading ? 'Running...' : 'Docking'}
      </button>
    </div>
  );
}

export default LeftPanel;

