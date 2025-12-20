import React, { useState } from "react";
import FormulationLeftPanel from "../components/FormulationLeftPanel";
import Viewer from "../components/Viewer";

import FormulationResultsPanel from "../components/FormulationResultsPanel";
import "../App.css";

/**
 * Frontend-only data source mapping.
 * Put these files in: public/micelle/C8/{multiframe.pdb, metrics.json}
 */
const MICELLE_DATASETS = {
  C8: {
    name: "C8",
    multiframePdbUrl: "/simatec101/a4/C8_multiframe.pdb",
    metricsUrl: "/simatec101/a4/C8_metrics.json",
  },
  C10: {
    name: "C10",
    multiframePdbUrl: "/simatec101/a4/C10_multiframe.pdb",
    metricsUrl: "/simatec101/a4/C10_metrics.json",
  },
  C12: {
    name: "C12",
    multiframePdbUrl: "/simatec101/a4/C12_multiframe.pdb",
    metricsUrl: "/simatec101/a4/C12_metrics.json",
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

  // You used this previously for a single receptor PDB. Keep it if needed elsewhere.
  const [selectedProteinFile, setSelectedProteinFile] = useState(null);

  // NEW: micelle dataset state
  const [micelleData, setMicelleData] = useState(null); // { name, multiframePdbText, metrics }
  const [frameIndex, setFrameIndex] = useState(0);

  const [results, setResults] = useState([]); // keep if your ResultsPanel expects array
  const [error, setError] = useState(null);

  const handleRun = async (selectedProteins) => {
    setLoading(true);
    setError(null);
    setResults([]);
    setMicelleData(null);
    setFrameIndex(0);

    if (!selectedProteins) { // If selectedProteins is null (deselected)
      setLoading(false);
      return;
    }

    const firstSelectedProtein = String(selectedProteins[0]);
    // Set the path to the selected protein PDB from public/a4
    setSelectedProteinFile(`/a4/${firstSelectedProtein}`);

    // Your current UI selects protein PDBs. For micelle stability, you said “call C files”.
    // Here we map any selection to C8 (or implement mapping logic below).
    // Example mapping: if selected item contains "C8" -> C8 else default C8.
    const datasetKey = firstSelectedProtein.replace('.pdb', ''); // Use C8, C10, C12 as keys
    const dataset = MICELLE_DATASETS[datasetKey];

    if (!dataset) {
      setError(`No micelle dataset configured for: ${datasetKey}`);
      setLoading(false);
      return;
    }

    try {
      // Load multiframe PDB + metrics JSON from /public
      const [multiframePdbText, metrics] = await Promise.all([
        fetchText(dataset.multiframePdbUrl),
        fetchJson(dataset.metricsUrl),
      ]);

      const nFrames = validateMetrics(metrics);

      // Store the dataset for the middle viewer + right results
      const packed = {
        name: dataset.name,
        multiframePdbText,
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
        <FormulationLeftPanel onRun={handleRun} loading={loading} />

        {/* ✅ Middle: 3D visualization
            IMPORTANT: your existing Viewer component must be updated to support:
              - micelleData.multiframePdbText (string)
              - frameIndex
              - onFrameChange
            If Viewer currently only accepts receptorFile, it will ignore these props until you update it.
        */}
        <Viewer
          receptorFile={selectedProteinFile} // old
          micellePdbText={micelleData?.multiframePdbText} // new
          frameIndex={frameIndex}
          onFrameChange={setFrameIndex}
          nFrames={micelleData?.nFrames || 0}
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
