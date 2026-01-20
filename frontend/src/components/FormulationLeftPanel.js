import React, { useState, useEffect, useRef } from 'react';

const micelleDataGroups = {
  "Single": [
    { id: "single_C8C10C12/C8.pdb", name: "C8" },
    { id: "single_C8C10C12/C10.pdb", name: "C10" },
    { id: "single_C8C10C12/C12.pdb", name: "C12" },
  ],
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

function FormulationLeftPanel({ onRun, loading, micelleData, frameIndex, onFrameChange }) {
  const [selectedMicelle, setSelectedMicelle] = useState(null);
  // const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef(null);

  const nFrames = micelleData?.nFrames || 0;

  // useEffect(() => {
  //   if (isPlaying && nFrames > 0) {
  //     animationRef.current = setInterval(() => {
  //       onFrameChange((prevFrameIndex) => (prevFrameIndex + 1) % nFrames);
  //     }, 200); // Adjust animation speed here (milliseconds)
  //   } else {
  //     clearInterval(animationRef.current);
  //   }
  //   return () => clearInterval(animationRef.current);
  // }, [isPlaying, nFrames, onFrameChange]);

  //  useEffect(() => {
  //   if (isPlaying && nFrames > 0) {
  //     animationRef.current = setInterval(() => {
  //       onFrameChange((prevFrameIndex) => (prevFrameIndex + 1) % nFrames);
  //     }, 200); // Adjust animation speed here (milliseconds)
  //   } else {
  //     clearInterval(animationRef.current);
  //   }
  //   return () => clearInterval(animationRef.current);
  // }, [isPlaying, nFrames, onFrameChange]);


  const handleMicelleChange = (micelleId) => {
    setSelectedMicelle(micelleId);
    onRun(micelleId);
    console.log('FF',frameIndex);
    // setIsPlaying(false); // Stop animation when a new micelle is selected
  };

  const handleFrameChange = (e) => {
    onFrameChange(parseInt(e.target.value, 10));
    // setIsPlaying(false); // Stop animation when frame is manually changed
  };

  const togglePlay = () => {
    // setIsPlaying(!isPlaying);
  };

  const goToFirstFrame = () => {
    onFrameChange(0);
    // setIsPlaying(false);
  };

  const goToLastFrame = () => {
    onFrameChange(nFrames > 0 ? nFrames - 1 : 0);
    // setIsPlaying(false);
  };

  return (
    <div style={{paddingTop: 0}} className="left-panel">
      {Object.keys(micelleDataGroups).map(category => (
        <div key={category} className="floating-section" style={{ marginBottom: '10px', paddingBottom: 5, paddingTop: 20}}>
          <h2 style={{ marginBottom: 10 }}>{category}</h2>
          <div style={{ marginTop: 10 }}>
            {micelleDataGroups[category].map((micelle) => (
              <div key={micelle.id} className="bioactivity-line">
                <div className="select-container">
                  <div>
                    <input
                      type="checkbox"
                      id={micelle.id}
                      name={category} // Use category as name for radio group
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

      {nFrames > 0 && (
        <div className="floating-section" style={{ marginBottom: '10px', paddingBottom: 5, paddingTop: 20}}>
          <h2 style={{ marginBottom: 10 }}>Frame Control</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            {/* <button onClick={goToFirstFrame} disabled={loading}>&#x23EE;</button> */}
             {/* To First */}
            {/* <button onClick={togglePlay} disabled={loading}>
              {isPlaying ? 'Pause' : 'Play'}
            </button> */}
            {/* <button onClick={goToLastFrame} disabled={loading}>&#x23ED;</button>  */}
            {/* To Last */}
          </div>
          <input
            type="range"
            min="0"
            max={nFrames > 0 ? nFrames - 1 : 0}
            value={frameIndex}
            onChange={handleFrameChange}
            disabled={loading}
            style={{ width: '100%' }}
          />
          <div style={{ textAlign: 'center', marginTop: '5px' }}>
            Frame: {frameIndex+1} / {nFrames}
          </div>
        </div>
      )}
    </div>
  );
}

export default FormulationLeftPanel;