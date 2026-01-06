import React, { useState } from 'react';

const micelleData = {
  "Single": [
    { id: "single_C8C10C12/C8.pdb", name: "C8" },
    { id: "single_C8C10C12/C10.pdb", name: "C10" },
    { id: "single_C8C10C12/C12.pdb", name: "C12" },
  ],
  // "Mixed": [
  //   { id: "mixed_C8C10C12/C8C10C12_111.pdb", name: "C8C10C12_111 Mixed" },
  //   { id: "mixed_C8C10C12/C8C10C12_112.pdb", name: "C8C10C12_112 Mixed" },
  //   { id: "mixed_C8C10C12/C8C10C12_121.pdb", name: "C8C10C12_121 Mixed" },
  //   { id: "mixed_C8C10C12/C8C10C12_122.pdb", name: "C8C10C12_122 Mixed" },
  //   { id: "mixed_C8C10C12/C8C10C12_211.pdb", name: "C8C10C12_211 Mixed" },
  //   { id: "mixed_C8C10C12/C8C10C12_212.pdb", name: "C8C10C12_212 Mixed" },
  //   { id: "mixed_C8C10C12/C8C10C12_221.pdb", name: "C8C10C12_221 Mixed" },
  // ]
  "Formulation design (C8:C10:C12)": [
    { id: "mixed_C8C10C12/C8C10C12_111.pdb", name: "1:1:1" },
    { id: "mixed_C8C10C12/C8C10C12_112.pdb", name: "1:1:2" },
    { id: "mixed_C8C10C12/C8C10C12_121.pdb", name: "1:2:1" },
    { id: "mixed_C8C10C12/C8C10C12_122.pdb", name: "1:2:2" },
    { id: "mixed_C8C10C12/C8C10C12_211.pdb", name: "2:1:1" },
    { id: "mixed_C8C10C12/C8C10C12_212.pdb", name: "2:1:2" },
    { id: "mixed_C8C10C12/C8C10C12_221.pdb", name: "2:2:1" },
  ]
};

function FormulationLeftPanel({ onRun, loading }) {
  const [selectedMicelle, setSelectedMicelle] = useState(null);

  const handleMicelleChange = (micelleId) => {
    setSelectedMicelle(micelleId);
    onRun(micelleId);
  };

  return (
    <div style={{paddingTop: 0}} className="left-panel">
      {Object.keys(micelleData).map(category => (
        <div key={category} className="floating-section" style={{ marginBottom: '10px', paddingBottom: 5, paddingTop: 20}}>
          <h2 style={{ marginBottom: 10 }}>{category}</h2>
          <div style={{ marginTop: 10 }}>
            {micelleData[category].map((micelle) => (
              <div key={micelle.id} className="bioactivity-line">
                <div className="select-container">
                  <div>
                    <input
                      type="checkbox"
                      id={micelle.id}
                      name="micelleSelection"
                      checked={selectedMicelle === micelle.id}
                      onChange={() => handleMicelleChange(micelle.id)}
                    />
                    <label htmlFor={micelle.id}>{micelle.name}</label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default FormulationLeftPanel;