import React from 'react';

function ResultsPanel({ results, error, selectedProtein, onSelectResult, selectedDockedFiles }) {
  return (
    <div style={{paddingTop: 0}} className="right-panel">
      <div className="floating-section">
        <h2>  Inhibition Ability </h2>
        {error && <p className="error">{error}</p>}
        {results.length > 0 ? (
          <>
            <h3 style={{ margin: 0 }}>Bioactivity Testing: </h3>
            <h4 style={{ margin: 0 }}>&nbsp;&nbsp;&nbsp;{selectedProtein && `${selectedProtein.protein.replace('.pdbqt', '')}`} </h4>

            {results.length <= 2 ? ( // Apply two-column table for 1 or 2 ligands
              <>
                {results.length === 1 && ( // Show "Bioactive Compound" header only for single ligand
                  <>
                    <h3 style={{ margin: 0 }}>Bioactive Compound: </h3>
                    <h4 style={{ margin: 0 }}>&nbsp;&nbsp;&nbsp;{results[0].ligandName.replace('.pdbqt', '')}</h4>
                  </>
                )}
                {results.length === 2 && (
                  <>
                    <h3 style={{ margin: 0 }}>Bioactive Compounds: </h3>
                    <h4 style={{ margin: 0 }}>&nbsp;&nbsp;&nbsp;{results[0].ligandName.replace('.pdbqt', '')} & {results[1].ligandName.replace('.pdbqt', '')}</h4>
                  </>
                )}
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Ligand Name</th>
                      <th>Affinity (kcal/mol)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results
                      .slice() // Create a shallow copy to avoid modifying the original state
                      .sort((a, b) => a.scores[0].affinity - b.scores[0].affinity) // Sort by affinity (most negative first)
                      .map((dockingResult, index) => (
                        <tr key={index}>
                          <td>{dockingResult.ligandName.replace('.pdbqt', '')}</td>
                          <td>{dockingResult.scores[0].affinity.toFixed(3)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {results.length === 2 && (
                  (() => {
                    const sortedResults = results.slice().sort((a, b) => a.scores[0].affinity - b.scores[0].affinity);
                    const ligand1Name = sortedResults[0].ligandName.replace('.pdbqt', '');
                    const ligand2Name = sortedResults[1].ligandName.replace('.pdbqt', '');
                    const proteinName = selectedProtein ? selectedProtein.protein.replace('.pdbqt', '') : 'the protein';

                    return (
                      <p style={{ marginTop: '10px', fontStyle: 'italic' }}>
                        {/* {ligand1Name} binds tighter than {ligand2Name} to {proteinName}. */}
                        <strong>{ligand1Name}</strong> binds tighter than <strong>{ligand2Name}</strong>.
                      </p>
                    );
                  })()
                )}
              </>
            ) : (
              // Existing detailed display for more than two ligands
              results.map((dockingResult, index) => {
                const isSelected = selectedDockedFiles.includes(dockingResult.dockedFile); // Use includes for array
                return (
                  <div 
                    key={index} 
                    style={{ 
                      borderRadius: '5px',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #007bff' : '2px solid transparent', // Highlight selected
                      marginBottom: '10px',
                      padding: '5px'
                    }}
                    onClick={() => onSelectResult(dockingResult.dockedFile)}
                  >
                    <h3 style={{ margin: 0 }}>Bioactive Compound: </h3>
                    <h4 style={{ margin: 0 }}>&nbsp;&nbsp;&nbsp;{dockingResult.ligandName.replace('.pdbqt', '')}</h4>
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
            )}
          </>
        ) : (
          <p>Docking has not been run yet.</p>
        )}
      </div>
    </div>
  );
}

export default ResultsPanel;
