import React, { useRef, useEffect } from 'react';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController } from 'chart.js';
import '../../src/App.css'; // For floating-section and other styles

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController);

// Define consistent colors for X, Y, Z components
const COLOR_X = 'rgb(255, 99, 132)'; // Red
const COLOR_Y = 'rgb(54, 162, 235)'; // Blue
const COLOR_Z = 'rgb(255, 206, 86)'; // Yellow

function FormulationResultsPanel({ micelleData, frameIndex, onFrameChange, error }) {
  const cmChartRef = useRef(null);
  const rgChartRef = useRef(null);
  const cmChartInstance = useRef(null);
  const rgChartInstance = useRef(null);

  
    

  // Effect for CM Chart
  useEffect(() => {
    if (cmChartInstance.current) {
      cmChartInstance.current.destroy();
    }

    if (micelleData && cmChartRef.current) {
      const ctx = cmChartRef.current.getContext('2d');
      const metrics = micelleData.metrics;

      cmChartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: metrics.times.map(time => time.toFixed(1)),
          datasets: [
            {
              label: 'Cm X (Å)',
              data: metrics.cx,
              borderColor: COLOR_X,
              tension: 0.1,
              pointRadius: 0,
              borderWidth: 1,
            },
            {
              label: 'Cm Y (Å)',
              data: metrics.cy,
              borderColor: COLOR_Y,
              tension: 0.1,
              pointRadius: 0,
              borderWidth: 1,
            },
            {
              label: 'Cm Z (Å)',
              data: metrics.cz,
              borderColor: COLOR_Z,
              tension: 0.1,
              pointRadius: 0,
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              // text: 'Center of Mass (Cm) Over Time',
              color: 'white',
            },
            legend: {
              position: 'top',
              labels: {
                color: 'white',
              },
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                title: (tooltipItems) => `Time: ${tooltipItems[0].label} ns`,
                label: (context) => {
                  let label = context.dataset.label || '';
                  if (label) label += ': ';
                  if (context.parsed.y !== null) label += context.parsed.y.toFixed(3) + ' Å';
                  return label;
                }
              }
            },
          },
          scales: {
            x: {
              title: { display: true, text: 'Time (ns)', color: 'white' },
              ticks: { color: 'white' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
            },
            y: {
              title: { display: true, text: 'Distance (Å)', color: 'white' },
              ticks: { color: 'white' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
            },
          },
          onClick: (event, elements) => {
            if (elements.length > 0 && onFrameChange) {
              onFrameChange(elements[0].index);
            }
          },
        },
        plugins: [],
      });
    }
    return () => {
      if (cmChartInstance.current) cmChartInstance.current.destroy();
    };
  }, [micelleData, frameIndex, onFrameChange]);

  // Effect for Rg Chart
  useEffect(() => {
    if (rgChartInstance.current) {
      rgChartInstance.current.destroy();
    }

    if (micelleData && rgChartRef.current) {
      const ctx = rgChartRef.current.getContext('2d');
      const metrics = micelleData.metrics;

      rgChartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: metrics.times.map(time => time.toFixed(1)),
          datasets: [
            // {
            //   label: 'Rg (Å)',
            //   data: metrics.rg,
            //   borderColor: 'rgb(75, 192, 192)', // A distinct color for overall Rg
            //   tension: 0.1,
            //   pointRadius: 0,
            //   borderWidth: 2,
            // },
            {
              label: 'Rg X (Å)',
              data: metrics.rgx,
              borderColor: COLOR_X,
              tension: 0.1,
              pointRadius: 0,
              borderWidth: 1,
            },
            {
              label: 'Rg Y (Å)',
              data: metrics.rgy,
              borderColor: COLOR_Y,
              tension: 0.1,
              pointRadius: 0,
              borderWidth: 1,
            },
            {
              label: 'Rg Z (Å)',
              data: metrics.rgz,
              borderColor: COLOR_Z,
              tension: 0.1,
              pointRadius: 0,
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              // text: 'Radius of Gyration (Rg) Over Time',
              color: 'white',
            },
            legend: {
              position: 'top',
              labels: {
                color: 'white',
              },
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                title: (tooltipItems) => `Time: ${tooltipItems[0].label} ns`,
                label: (context) => {
                  let label = context.dataset.label || '';
                  if (label) label += ': ';
                  if (context.parsed.y !== null) label += context.parsed.y.toFixed(3) + ' Å';
                  return label;
                }
              }
            },
          },
          scales: {
            x: {
              title: { display: true, text: 'Time (ns)', color: 'white' },
              ticks: { color: 'white' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
            },
            y: {
              title: { display: true, text: 'Distance (Å)', color: 'white' },
              ticks: { color: 'white' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
            },
          },
          onClick: (event, elements) => {
            if (elements.length > 0 && onFrameChange) {
              onFrameChange(elements[0].index);
            }
          },
        },
        plugins: [],
      });
    }
    return () => {
      if (rgChartInstance.current) rgChartInstance.current.destroy();
    };
  }, [micelleData, frameIndex, onFrameChange]);

  if (error) {
    return (
      <div className="right-panel">
        <div className="floating-section">
          <h2>Results</h2>
          <p className="error">{error}</p>
        </div>
      </div>
    );
  }

  if (!micelleData) {
    return (
      <div className="right-panel">
        <div className="floating-section">
          <h2>Micelle Stability</h2>
          {/* <p>Select a protein to run a simulation and see results.</p> */}
        </div>
      </div>
    );
  }

  const metrics = micelleData.metrics;
  

  return (
    <div className="right-panel">
      <div className="floating-section">
        <h2>Micelle Stability ({micelleData.name})</h2>
        {/* <p><strong>Protein:</strong> </p> */}
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th style={{ textAlign: "right" }}>Center of Mass (Cm)</th>
              <th style={{ textAlign: "right" }}>Radius of Gyration (Rg)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>X</td>
              <td style={{ textAlign: "right" }}>{metrics.cx[micelleData.nFrames - 1] !== undefined ? metrics.cx[micelleData.nFrames - 1].toFixed(3) : 'N/A'}</td>
              <td style={{ textAlign: "right" }}>{metrics.rgx[micelleData.nFrames - 1] !== undefined ? metrics.rgx[micelleData.nFrames - 1].toFixed(3) : 'N/A'}</td>
            </tr>
            <tr>
              <td>Y</td>
              <td style={{ textAlign: "right" }}>{metrics.cy[micelleData.nFrames - 1] !== undefined ? metrics.cy[micelleData.nFrames - 1].toFixed(3) : 'N/A'}</td>
              <td style={{ textAlign: "right" }}>{metrics.rgy[micelleData.nFrames - 1] !== undefined ? metrics.rgy[micelleData.nFrames - 1].toFixed(3) : 'N/A'}</td>
            </tr>
            <tr>
              <td>Z</td>
              <td style={{ textAlign: "right" }}>{metrics.cz[micelleData.nFrames - 1] !== undefined ? metrics.cz[micelleData.nFrames - 1].toFixed(3) : 'N/A'}</td>
              <td style={{ textAlign: "right" }}>{metrics.rgz[micelleData.nFrames - 1] !== undefined ? metrics.rgz[micelleData.nFrames - 1].toFixed(3) : 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="floating-section" style={{ marginTop: 0, paddingTop: 0 }}>
        {/* <p><strong>Current Frame:</strong> {frameIndex + 1} / {micelleData.nFrames}</p> */}
        <div style={{ height: '225px', marginTop: 0, paddingTop: 0 }}>
          <canvas ref={cmChartRef}></canvas>
        </div>
      </div>

      <div className="floating-section" style={{ marginTop: 0, paddingTop: 0 }}>
        <div style={{ height: '225px', marginTop: 0, paddingTop: 0  }}>
          <canvas ref={rgChartRef}></canvas>
        </div>
      </div>
    </div>
  );
}

export default FormulationResultsPanel;