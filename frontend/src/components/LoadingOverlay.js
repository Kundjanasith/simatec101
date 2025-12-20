import React from 'react';
import './LoadingOverlay.css';

function LoadingOverlay({ percentage }) {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <p>Docking in progress...</p>
      {/* {percentage !== null && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
        </div>
      )} */}
      {/* {percentage !== null && <p className="progress-percentage">{percentage}%</p>} */}
    </div>
  );
}

export default LoadingOverlay;