import React from 'react';
import { dockingScores, getDisplayName } from './proteinData';

function MembraneResultsPanel({ selectedProteins }) {
  return (
    <div style={{paddingTop: 0}} className="right-panel">
      <div className="floating-section">
        <h2>Results</h2>
        {selectedProteins && selectedProteins.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Docking Score</th>
              </tr>
            </thead>
            <tbody>
              {selectedProteins.map(protein => {
                const result = dockingScores[protein];
                const displayName = result ? getDisplayName(protein, result.name) : '';
                return (
                  <tr key={protein}>
                    <td>{displayName}</td>
                    <td>{result ? result.score : 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>Please select a protein to see the results.</p>
        )}
      </div>
    </div>
  );
}

export default MembraneResultsPanel;
