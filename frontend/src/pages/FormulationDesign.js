import React, { useState, useEffect } from "react";
import FormulationLeftPanel from "../components/FormulationLeftPanel";
import Viewer from "../components/Viewer";

import FormulationResultsPanel from "../components/FormulationResultsPanel";
import "../App.css";

/**
 * Frontend-only data source mapping.
 * Put these files in: public/micelle/C8/{multiframe.pdb, metrics.json}
 */
const MICELLE_DATASETS = {
  "single_C8C10C12/C8.pdb": {
    name: "C8",
    singlePdbUrl: "/simatec101/a4/single_C8C10C12/C8.pdb",
    multiframePdbUrl: "/simatec101/a4/single_C8C10C12/C8_multiframe.pdb",
    metricsUrl: "/simatec101/a4/single_C8C10C12/C8_metrics.json"
  },
  "single_C8C10C12/C10.pdb": {
    name: "C10",
    singlePdbUrl: "/simatec101/a4/single_C8C10C12/C10.pdb",
    multiframePdbUrl: "/simatec101/a4/single_C8C10C12/C10_multiframe.pdb",
    metricsUrl: "/simatec101/a4/single_C8C10C12/C10_metrics.json"
  },
  "single_C8C10C12/C12.pdb": {
    name: "C12",
    singlePdbUrl: "/simatec101/a4/single_C8C10C12/C12.pdb",
    multiframePdbUrl: "/simatec101/a4/single_C8C10C12/C12_multiframe.pdb",
    metricsUrl: "/simatec101/a4/single_C8C10C12/C12_metrics.json"
  },
  "mixed_C8C10C12/C8C10C12_111.pdb": {
    name: "C8C10C12 1:1:1",
    singlePdbUrl: "/simatec101/a4/mixed_C8C10C12/C8C10C12_111.pdb",
    multiframePdbUrl: "/simatec101/a4/mixed_C8C10C12/C8C10C12_111_multiframe.pdb",
    metricsUrl: "/simatec101/a4/mixed_C8C10C12/C8C10C12_111_metrics.json"
  },
  "mixed_C8C10C12/C8C10C12_112.pdb": {
    name: "C8C10C12 1:1:2",
    singlePdbUrl: "/simatec101/a4/mixed_C8C10C12/C8C10C12_112.pdb",
    multiframePdbUrl: "/simatec101/a4/mixed_C8C10C12/C8C10C12_112_multiframe.pdb",
    metricsUrl: "/simatec101/a4/mixed_C8C10C12/C8C10C12_112_metrics.json"
  },
  "mixed_C8C10C12/C8C10C12_121.pdb": {
    name: "C8C10C12 1:2:1",
    singlePdbUrl: "/simatec101/a4/mixed_C8C10C12/C8C10C12_121.pdb",
    multiframePdbUrl: "/simatec101/a4/mixed_C8C10C12/C8C10C12_121_multiframe.pdb",
    metricsUrl: "/simatec101/a4/mixed_C8C10C12/C8C10C12_121_metrics.json"
  },
  "mixed_C8C10C12/C8C10C12_122.pdb": {
    name: "C8C10C12 1:2:2",
    singlePdbUrl: "/simatec101/a4/mixed_C8C10C12/C8C10C12_122.pdb",
    multiframePdbUrl: "/simatec101/a4/mixed_C8C10C12/C8C10C12_122_multiframe.pdb",
    metricsUrl: "/simatec101/a4/mixed_C8C10C12/C8C10C12_122_metrics.json"
  },
  "mixed_C8C10C12/C8C10C12_211.pdb": {
    name: "C8C10C12 2:1:1",
    singlePdbUrl: "/simatec101/a4/mixed_C8C10C12/C8C10C12_211.pdb",
    multiframePdbUrl: "/simatec101/a4/mixed_C8C10C12/C8C10C12_211_multiframe.pdb",
    metricsUrl: "/simatec101/a4/mixed_C8C10C12/C8C10C12_211_metrics.json"
  },
  "mixed_C8C10C12/C8C10C12_212.pdb": {
    name: "C8C10C12 2:1:2",
    singlePdbUrl: "/simatec101/a4/mixed_C8C10C12/C8C10C12_212.pdb",
    multiframePdbUrl: "/simatec101/a4/mixed_C8C10C12/C8C10C12_212_multiframe.pdb",
    metricsUrl: "/simatec101/a4/mixed_C8C10C12/C8C10C12_212_metrics.json"
  },
  "mixed_C8C10C12/C8C10C12_221.pdb": {
    name: "C8C10C12 2:2:1",
    singlePdbUrl: "/simatec101/a4/mixed_C8C10C12/C8C10C12_221.pdb",
    multiframePdbUrl: "/simatec101/a4/mixed_C8C10C12/C8C10C12_221_multiframe.pdb",
    metricsUrl: "/simatec101/a4/mixed_C8C10C12/C8C10C12_221_metrics.json"
  },
};

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
  return await res.text();
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
  return await res.json();
}

function validateMetrics(m) {
  const requiredArrays = ["times", "cx", "cy", "cz", "rg", "rgx", "rgy", "rgz"];
  for (const k of requiredArrays) {
    if (!Array.isArray(m?.[k])) throw new Error(`metrics.json missing array: ${k}`);
  }
  const n = m.times.length;
  for (const k of requiredArrays) {
    if (m[k].length !== n) throw new Error(`metrics.json length mismatch: ${k} != times`);
  }
  return n;
}

function FormulationDesign() {
  const [loading, setLoading] = useState(false);

  // NEW: micelle dataset state
  const [micelleData, setMicelleData] = useState(null); // { name, multiframePdbText, metrics }
  const [frameIndex, setFrameIndex] = useState(0);
  const [selectedMicelleId, setSelectedMicelleId] = useState(null); // New state for selected micelle ID
  const [currentPdbText, setCurrentPdbText] = useState(null); // New state for current frame's PDB text

  const [results, setResults] = useState([]); // keep if your ResultsPanel expects array
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFramePdb = async () => {
      if (selectedMicelleId !== null && micelleData?.nFrames > 0) {
        setLoading(true);
        setError(null);
        try {
          const dataset = MICELLE_DATASETS[selectedMicelleId];
          if (!dataset) {
            throw new Error(`No micelle dataset configured for: ${selectedMicelleId}`);
          }

          // Construct the frame-specific PDB URL
          // Assuming frame files are named like C8_frame_0.pdb, C8_frame_1.pdb, etc.
          const basePdbName = dataset.singlePdbUrl.split('/').pop().replace('.pdb', '');
          const basePath = dataset.singlePdbUrl.substring(0, dataset.singlePdbUrl.lastIndexOf('/') + 1);
          const framePdbUrl = `${basePath}${basePdbName}_frame_${frameIndex + 1}.pdb`;

          const pdbText = await fetchText(framePdbUrl);
          setCurrentPdbText(pdbText);
        } catch (e) {
          setError(e?.message || "Failed to load frame PDB file.");
          setCurrentPdbText(null);
        } finally {
          setLoading(false);
        }
      } else {
        setCurrentPdbText(null);
      }
    };

    loadFramePdb();
  }, [selectedMicelleId, frameIndex, micelleData?.nFrames]);

  const handleRun = async (micelleId) => {
    setLoading(true);
    setError(null);
    setResults([]);
    setMicelleData(null);
    setFrameIndex(0);
    setSelectedMicelleId(micelleId); // Set the selected micelle ID

    if (!micelleId) { // If micelleId is null (deselected)
      setLoading(false);
      return;
    }

    const dataset = MICELLE_DATASETS[micelleId];

    if (!dataset) {
      setError(`No micelle dataset configured for: ${micelleId}`);
      setLoading(false);
      return;
    }

    try {
      let metrics = null;
      let nFrames = 0;

      metrics = await fetchJson(dataset.metricsUrl);
      nFrames = validateMetrics(metrics);

      // Store the dataset for the middle viewer + right results
      const packed = {
        name: dataset.name,
        metrics,
        nFrames,
      };
      setMicelleData(packed);

      // Populate your existing ResultsPanel structure too (if it expects results[])
      // This is “summary at current frame”; the panel can also use micelleData for graphs.
      const i = 0;
      setResults([
        {
          proteinName: dataset.name,
          micelleStability: {
            cx: metrics.cx[i],
            cy: metrics.cy[i],
            cz: metrics.cz[i],
          },
          radiusOfGyration: {
            rg: metrics.rg[i],
            rg_x: metrics.rgx[i],
            rg_y: metrics.rgy[i],
            rg_z: metrics.rgz[i],
          },
        },
      ]);

      setFrameIndex(0);
    } catch (e) {
      setError(e?.message || "Failed to load micelle files from public/.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div style={{ textAlign: 'center', marginLeft: '2rem', marginTop: 0, paddingTop: 0, marginBottom: 10, paddingBottom: 0}}>
        <p style={{ fontSize: '2rem', color: 'white', marginTop: 0, paddingTop: 0, marginBottom: 0, fontWeight: 'bold' }}>
          Formulation Design  Service
        </p>
      </div>

      <div style={{ marginTop: 0, paddingTop: 0 }} className="main-content">
        <FormulationLeftPanel
          onRun={handleRun}
          loading={loading}
          micelleData={micelleData} // Pass micelleData
          frameIndex={frameIndex}
          onFrameChange={setFrameIndex}
        />

        {/* ✅ Middle: 3D visualization
            IMPORTANT: your existing Viewer component must be updated to support:
              - micelleData.multiframePdbText (string)
              - frameIndex
              - onFrameChange
            If Viewer currently only accepts receptorFile, it will ignore these props until you update it.
        */}
        <Viewer
          pdbText={currentPdbText}
        />

        {/* ✅ Right: numerical results + graph
            Your panel should read:
              - micelleData.metrics arrays to plot vs frame
              - frameIndex to show current frame values
        */}
        <FormulationResultsPanel
          results={results} // keep compatibility
          error={error}
          micelleData={micelleData}
          frameIndex={frameIndex}
          onFrameChange={setFrameIndex}
        />
      </div>

      </div>
  );
}

export default FormulationDesign;
