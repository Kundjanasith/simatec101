import React from 'react';

function ResultsPanel({ results, error, selectedProtein, onSelectResult, selectedDockedFile }) {
  return (
    <div className="right-panel">
      <div className="floating-section">
        <h2> Inhibition Ability </h2>
        {error && <p className="error">{error}</p>}
        {results.length > 0 ? (
          results.map((dockingResult, index) => {
            const isSelected = dockingResult.dockedFile === selectedDockedFile;
            return (
              <div 
                key={index} 
                style={{ 
                  // marginBottom: '20px', 
                  // padding: '10px', 
                  // border: '2px solid transparent',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
                onClick={() => onSelectResult(dockingResult.dockedFile)}
              >
                <h3>Bioactivity Testing: </h3>
                <h4>&nbsp;&nbsp;&nbsp;{selectedProtein && `${selectedProtein.protein.replace('.pdbqt', '')}`} </h4>
                <h3>Bioactive Compound: </h3>
                <h4>&nbsp;&nbsp;&nbsp;{dockingResult.ligandName.replace('.pdbqt', '')}</h4>
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Mode</th>
                      <th>Affinity (kcal/mol)</th>
                      <th>RMSD l.b.</th>
                      <th>RMSD u.b.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dockingResult.scores.map((score) => (
                      <tr key={score.mode}>
                        <td>{score.mode}</td>
                        <td>{score.affinity.toFixed(3)}</td>
                        <td>{score.rmsd_lb.toFixed(3)}</td>
                        <td>{score.rmsd_ub.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })
        ) : (
          <p>Docking has not been run yet.</p>
        )}
      </div>
    </div>
  );
}

export default ResultsPanel;
