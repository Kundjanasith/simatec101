import React, { useEffect, useRef } from 'react';
import * as $3Dmol from '3dmol';

function ViewerMembrane({ receptorFile, ligandFiles, micellePdbText, frameIndex, onFrameChange, nFrames }) {
  const viewport = useRef(null);
  const viewerRef = useRef(null);
  console.log('TEM RECEPTOR',receptorFile);
  console.log('TEM LIGAND',ligandFiles)
  const ENABLE_SPIN_BY_DEFAULT = false;
  const MODEL_TO_DISPLAY = 1; // User can adjust this value to select the desired model (1-based index)

  // Initialize 3Dmol viewer once on component mount
  useEffect(() => {
    if (!viewport.current) return;
    console.log("Viewer: Initializing 3Dmol viewer");
    viewerRef.current = $3Dmol.createViewer(viewport.current, {
      defaultcolors: $3Dmol.rasmolAmino,
      backgroundAlpha: 0,
    });
    const viewer = viewerRef.current;
    const handleResize = () => viewer.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      console.log("Viewer: Destroying 3Dmol viewer");
      window.removeEventListener('resize', handleResize);
      if (viewerRef.current && typeof viewerRef.current.destroy === 'function') {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // Load receptor and ligands or micelle data when props change
  useEffect(() => {
    if (!viewerRef.current) return;

    const viewer = viewerRef.current;
    viewer.clear();
    console.log("Viewer: Cleared. Loading new data.", { receptorFile, ligandFiles, micellePdbText, frameIndex });

    const loadData = async () => {
      console.log('AAAA')
      console.log({ receptorFile, ligandFiles, micellePdbText, frameIndex, nFrames, ENABLE_SPIN_BY_DEFAULT });
      // TEM WORK
      receptorFile = ligandFiles[0]
      ligandFiles = []
      try {
        if (micellePdbText) {
          // Handle multiframe PDB for micelle data
          console.log("Viewer: Loading micelle multiframe PDB.");
          viewer.addModel(micellePdbText, 'pdb', { multiframe: true });
          viewer.setStyle({},{cartoon: {color: 'spectrum'}});
          viewer.setFrame(frameIndex);
          
          console.log(`Viewer: Displaying frame ${frameIndex} of micelle data.`);
        } else {
          // Existing logic for receptor and ligands
          // --- 1. Load Receptor ---
          if (receptorFile) {
            const receptorPath = `${process.env.PUBLIC_URL}${receptorFile}`;
            console.log("Viewer: Fetching receptor:", receptorPath);
            const receptorResponse = await fetch(receptorPath);
            if (!receptorResponse.ok) throw new Error(`Failed to load receptor: ${receptorPath}`);
            const receptorData = await receptorResponse.text();
            
            viewer.addModel(receptorData, receptorFile.split('.').pop());
            viewer.setStyle({ hetflag: false }, { cartoon: { color: 'spectrum' } });
            console.log("Viewer: Receptor loaded and styled.");
          }

          // --- 2. Load Ligands ---
          if (ligandFiles && ligandFiles.length > 0) {
            console.log(`Viewer: Processing ${ligandFiles.length} ligand(s).`);
            
            for (let i = 0; i < ligandFiles.length; i++) {
              const ligandPath = ligandFiles[i]; // Expects the correct, final path from App.js
              if (typeof ligandPath !== 'string') {
                  console.error("Viewer: Ligand file path is not a string:", ligandPath);
                  continue;
              }
              

              const ligandFilename = ligandPath.split('/').pop();
              const pureLigandName = ligandFilename.replace('.pdb', '').split('_').pop();
              
              // Construct paths for supplementary files based on the correct ligand path
              const xyzPath = ligandPath.replace('/outputs/', '/xyz/').replace('.pdb', '.txt');
              const resultsPath = ligandPath.replace('/outputs/', '/results/').replace('.pdb', '.txt');

              console.log(`Viewer: Loading ligand #${i + 1}: ${pureLigandName}`);
              console.log(`  - PDBQT: ${process.env.PUBLIC_URL}${ligandPath}`);
              console.log(`  - XYZ: ${process.env.PUBLIC_URL}${xyzPath}`);
              console.log(`  - Results: ${process.env.PUBLIC_URL}${resultsPath}`);

              const [ligandResponse, xyzResponse, affinityResponse] = await Promise.all([
                fetch(`${process.env.PUBLIC_URL}${ligandPath}`),
                fetch(`${process.env.PUBLIC_URL}${xyzPath}`),
                fetch(`${process.env.PUBLIC_URL}${resultsPath}`)
              ]).catch(err => {
                  console.error(`Viewer: Failed to fetch data for ${pureLigandName}`, err);
                  return [];
              });

              if (!ligandResponse || !ligandResponse.ok) {
                console.error(`Viewer: Skipping ligand ${pureLigandName}: Could not fetch PDBQT file at ${ligandPath}. Status: ${ligandResponse?.status}`);
                continue;
              }

              const ligandData = await ligandResponse.text();
              
              // Split the PDBQT data into individual models
              const models = ligandData.split('ENDMDL').filter(m => m.trim() !== '');

              if (models.length === 0 && ligandData.includes('ATOM')) {
                  models.push(ligandData);
              } else if (models.length === 0) {
                  console.error(`Viewer: Skipping ligand file ${ligandFilename}: No valid model data found.`);
                  continue;
              }

              // --- Model Selection Logic ---
              let ligandModelIndex = MODEL_TO_DISPLAY - 1;
              if (ligandModelIndex < 0 || ligandModelIndex >= models.length) {
                  console.warn(`Viewer: Configured model ${MODEL_TO_DISPLAY} is out of bounds for ${ligandFilename}. Displaying model 1 instead.`);
                  // If the configured model is out of bounds, default to the first model
                  ligandModelIndex = 0; 
              }

              const modelContent = models[ligandModelIndex];
              const addedModel = viewer.addModel(modelContent, 'pdbqt');
              const modelId = addedModel.model_id;
              viewer.setStyle({ model: modelId }, { cartoon: { color: 'spectrum' } });

              console.log(`Viewer: Displaying model ${MODEL_TO_DISPLAY} (index ${ligandModelIndex}) from ${ligandFilename} as 3Dmol model ID ${modelId}`);
              
              // viewer.setStyle({ model: modelId }, { 
              //   stick: {
              //     radius: 0.3,          // thickness of sticks
              //     hidden: false,        // hide sticks
              //     singleBonds: true,    // show single bonds
              //     colorscheme: "Jmol",  // built-in color schemes
              //     color: "yellow",         // explicit color
              //     opacity: 5.0,         // transparency (0–1)
              //     bondScale: 5.0,       // scale bond length
              //     cap: true,            // flat ends on sticks
              //     linewidth: 100,         // line thickness (WebGL lines)
              //     zOffset: 0            // depth offset for overlap control
              //   }
              // });

              // viewer.setStyle({ model: modelId }, { stick: { radius: 5} });
              // viewer.setStyle({ model: modelId },{ cartoon: 'yellow' });
              // viewer.addModel(modelContent, 'pdbqt');
              // viewer.setStyle({ hetflag: true }, { stick: { radius: 5000000} });

              // --- Labeling Logic ---
              if (xyzResponse && xyzResponse.ok && affinityResponse && affinityResponse.ok) {
                  const xyzText = await xyzResponse.text();
                  
                  const xyz = xyzText.split(',');
                  
                  

                  if (xyz.length === 3) {
                      const labelPos = { x: parseFloat(xyz[0]), y: parseFloat(xyz[1]), z: parseFloat(xyz[2]) };
                      viewer.addLabel(
                          `${pureLigandName}`,
                          {
                              position: labelPos,
                              backgroundColor: null,
                              backgroundOpacity: 0.0,
                              fontColor: 'white',
                              fontSize: 14,
                              inFront: true
                          }
                      );
                      console.log(`Viewer: Added label for ${pureLigandName} at`, labelPos);
                  }
              } else {
                  console.warn(`Viewer: Missing or failed to fetch xyz/affinity data for ${pureLigandName}. Adding fallback label.`);
                  viewer.addLabel(pureLigandName, {
                      font: 'sans-serif',
                      fontSize: 14,
                      fontColor: 'black',
                      backgroundColor: 'white',
                      backgroundOpacity: 0.8,
                  }, { model: modelId });
              }
            }
          }
        }

        // --- 3. Finalize Scene ---
        console.log("Viewer: All data loaded. Zooming and rendering.");
        viewer.zoomTo();
        viewer.render();
        viewer.spin(ENABLE_SPIN_BY_DEFAULT);

      } catch (error) {
        console.error("Viewer: Error during visualization setup:", error);
      }
    };

    loadData();

  }, [receptorFile, ligandFiles, micellePdbText, frameIndex, nFrames, ENABLE_SPIN_BY_DEFAULT]);

  const handleZoomIn = () => {
    if (viewerRef.current) viewerRef.current.zoom(1.2);
  };

  const handleZoomOut = () => {
    if (viewerRef.current) viewerRef.current.zoom(1 / 1.2);
  };

  return (
    <div className="viewer-panel">
      <div ref={viewport} style={{ width: '100%', height: '100%' }}></div>
      <div className="zoom-controls">
          <button onClick={handleZoomIn}>&#x2795;</button>
          <button onClick={handleZoomOut}>&#x2796;</button>
        </div>

      
    </div>
  );
}

export default ViewerMembrane;