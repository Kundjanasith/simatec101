import React, { useRef, useEffect, useState } from 'react';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController } from 'chart.js';
import '../../src/App.css'; // For floating-section and other styles

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, LineController);

// Define consistent colors for X, Y, Z components
const COLOR_X = 'rgb(255, 99, 132)'; // Red
const COLOR_Y = 'rgb(54, 162, 235)'; // Blue
const COLOR_Z = 'rgb(255, 206, 86)'; // Yellow

function FormulationResultsPanel({ micelleData, frameIndex, onFrameChange, error, aggregatesCsvUrl }) {
  const cmChartRef = useRef(null);
  const aggregatesChartRef = useRef(null); // New ref for the aggregates chart
  const rgChartRef = useRef(null);
  const cmChartInstance = useRef(null);
  const rgChartInstance = useRef(null);
  const aggregatesChartInstance = useRef(null); // New chart instance ref
  const [aggregatesData, setAggregatesData] = useState(null); // New state for CSV data

  useEffect(() => {
    const fetchAggregatesData = async () => {
      if (aggregatesCsvUrl) {
        try {
          const response = await fetch(aggregatesCsvUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch CSV: ${response.statusText}`);
          }
          const csvText = await response.text();
          const lines = csvText.trim().split('\n');
          const headers = lines[0].split(',');
          const data = lines.slice(1).map(line => {
            const values = line.split(',');
            return headers.reduce((obj, header, index) => {
              obj[header.trim()] = parseFloat(values[index]);
              return obj;
            }, {});
          });
          setAggregatesData(data);
        } catch (err) {
          console.error("Error fetching or parsing aggregates CSV:", err);
          setAggregatesData(null);
        }
      }
      else {
        setAggregatesData(null);
      }
    };

    fetchAggregatesData();
  }, [aggregatesCsvUrl]);

  // Effect for Aggregates Chart
  useEffect(() => {
    if (aggregatesChartInstance.current) {
      aggregatesChartInstance.current.destroy();
    }

    if (aggregatesData && aggregatesChartRef.current) {
      const ctx1 = aggregatesChartRef.current.getContext('2d');

      const labels = aggregatesData.map(row => row.frame);
      const c8Data = aggregatesData.map(row => row.C8);
      const c10Data = aggregatesData.map(row => row.C10);
      const c12Data = aggregatesData.map(row => row.C12);
      console.log('C8',c8Data)
      console.log('C10',c10Data)
      console.log('C12',c12Data)

      const datasetsA = [
        {
          label: 'C8',
          data: [2,5],
          borderColor: 'rgb(255, 99, 132)', // Red
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 1,
        },
        {
          label: 'C10',
          data: c10Data,
          borderColor: 'rgb(54, 162, 235)', // Blue
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 1,
        },
        {
          label: 'C12',
          data: c12Data,
          borderColor: 'rgb(75, 192, 192)', // Green
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 1,
        }
      ];

      // if (true) {
      //   datasets.push({
      //     label: 'C8',
      //     data: c8Data,
      //     borderColor: 'rgb(255, 99, 132)', // Red
      //     tension: 0.1,
      //     pointRadius: 0,
      //     borderWidth: 1,
      //   });
      // }
      // if (true) {
      //   datasets.push({
      //     label: 'C10',
      //     data: c10Data,
      //     borderColor: 'rgb(54, 162, 235)', // Blue
      //     tension: 0.1,
      //     pointRadius: 0,
      //     borderWidth: 1,
      //   });
      // }
      // if (true) {
      //   datasets.push({
      //     label: 'C12',
      //     data: c12Data,
      //     borderColor: 'rgb(75, 192, 192)', // Green
      //     tension: 0.1,
      //     pointRadius: 0,
      //     borderWidth: 1,
      //   });
      // }

      aggregatesChartInstance.current = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: aggregatesData.map(row => row.frame),
          datasets: [
        {
          label: 'C8',
          data: c8Data,
          borderColor: 'rgb(255, 99, 132)', // Red
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 1,
        },
        {
          label: 'C10',
          data: c10Data,
          borderColor: 'rgb(54, 235, 54)', // Blue
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 1,
        },
        {
          label: 'C12',
          data: c12Data,
          borderColor: 'rgba(199, 218, 81, 1)', // Green
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 1,
        }
      ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Aggregates Per Frame',
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
                title: (tooltipItems) => `Frame: ${tooltipItems[0].label}`,
                label: (context) => {
                  let label = context.dataset.label || '';
                  if (label) label += ': ';
                  if (context.parsed.y !== null) label += context.parsed.y.toFixed(0);
                  return label;
                }
              }
            },
          },
          scales: {
            x: {
              title: { display: true, text: 'Frame', color: 'white' },
              ticks: { color: 'white' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
            },
            y: {
              title: { display: true, text: 'Number of aggregate molecules', color: 'white' },
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
      if (aggregatesChartInstance.current) aggregatesChartInstance.current.destroy();
    };
  }, [aggregatesData]);
  useEffect(() => {
    if (cmChartInstance.current) {
      cmChartInstance.current.destroy();
    }

    if (micelleData && cmChartRef.current) {
      const ctx = cmChartRef.current.getContext('2d');
      const metrics = micelleData.metrics;

      console.log(metrics.cx)
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
        {/* <table>
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
        </table> */}
        {/* <div style={{ height: '225px', marginTop: 0, paddingTop: 0 }}>
          <canvas ref={cmChartRef}></canvas>
        </div> */}
        <div style={{ height: '225px', marginTop: 0, paddingTop: 0 }}>
          <canvas ref={aggregatesChartRef}></canvas>
        </div>
      </div>
      <div className="floating-section" style={{ marginTop: 0, paddingTop: 0 }}>
        {/* <div style={{ height: '225px', marginTop: 0, paddingTop: 0  }}>
          <canvas ref={rgChartRef}></canvas>
        </div> */}
        {micelleData && (
          <img src="/simatec101/a4/b_figure.png" alt="B Figure" style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }} />
        )}
      </div>
    </div>
  );
}

export default FormulationResultsPanel;