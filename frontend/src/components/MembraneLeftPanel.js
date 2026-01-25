import React, { useState } from 'react';
import { proteinGroups, proteinNameMapping } from './proteinData';

// function MembraneLeftPanel({ onRun, loading }) {
//   const [selectedProteins, setSelectedProteins] = useState([]);

//   const handleProteinChange = (protein) => {
//     const newSelection = selectedProteins.includes(protein)
//       ? selectedProteins.filter(p => p !== protein)
//       : [...selectedProteins, protein];

//     setSelectedProteins(newSelection);
//     onRun(newSelection);
    
//   };
function MembraneLeftPanel({ onRun, loading }) {
  const [selectedProtein, setSelectedProtein] = useState(null);

  const handleProteinChange = (protein) => {
    setSelectedProtein(protein);
    onRun([protein]); // keep your onRun API the same (array)
  };

  const renderProteinLabel = (proteinName) => {
  // Example proteinName:
  // "8Sa-globulin-MUB2"
  // "11S-legumin"
  // "B-lactoglobulin-MUBRV"

  let proteinColor = "#FFFFFF"; // default
  let ligandColor = "#FFFFFF";
  let ligandResidueName = "";

  // --- protein color (same logic as ViewerMembrane) ---
  if (proteinName.includes("8S")) {
    proteinColor = "#FF0000"; // red
  } else if (proteinName.includes("7S")) {
    proteinColor = "#00FF00"; // green
  } else if (proteinName.includes("11S")) {
    proteinColor = "#0000FF"; // blue
  } else if (proteinName.includes("BLG")) {
    proteinColor = "#FFFF00"; // yellow
  }

  // --- ligand color ---
  if (proteinName.includes("MUB2")) {
    ligandColor = "#FF00FF";
    ligandResidueName = "MUB2";
  } else if (proteinName.includes("MUBRV")) {
    ligandColor = "#00FFFF";
    ligandResidueName = "MUBRV";
  } else if (proteinName.includes("NAGNAM")) {
    ligandColor = "#FFA500";
    ligandResidueName = "NAGNAM";
  } else if (proteinName.includes("SRRP5")) {
    ligandColor = "#800080";
    ligandResidueName = "SRRP5";
  }

  // --- split main protein part ---
  const baseName = proteinName.split("-")[0];

  return (
    <>
      {/* Protein */}
      <span style={{ color: proteinColor }}>{baseName}</span>

      {/* Ligand (if exists) */}
      {ligandResidueName && (
        <>
          <span style={{ color: "#FFFFFF" }}>-</span>
          <span style={{ color: ligandColor }}>{ligandResidueName}</span>
        </>
      )}
    </>
  );
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
                          // checked={selectedProteins.includes(protein)}
                          checked={selectedProtein === protein}
                          onChange={() => handleProteinChange(protein)}
                          //  disabled={loading}
                        />
                        {/* <label htmlFor={protein}>{proteinNameMapping[protein]}</label> */}
                        <label htmlFor={protein}>
                          {renderProteinLabel(proteinNameMapping[protein])}
                        </label>
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