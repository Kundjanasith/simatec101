import React, { useEffect, useRef } from 'react';
import * as $3Dmol from '3dmol';

function Viewer({ receptorFile, ligandFiles }) {
  const viewport = useRef(null);
  const viewerRef = useRef(null);
  const ENABLE_SPIN_BY_DEFAULT = false;

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

  // Load receptor and ligands when props change
  useEffect(() => {
    if (!viewerRef.current) return;

    const viewer = viewerRef.current;
    viewer.clear();
    console.log("Viewer: Cleared. Loading new data.", { receptorFile, ligandFiles });

    // const colorSchemes = ['carbon'];

    const loadData = async () => {
      try {
        // --- 1. Load Receptor ---
        if (receptorFile) {
          const receptorPath = `${process.env.PUBLIC_URL}${receptorFile}`;
          console.log("Viewer: Fetching receptor:", receptorPath);
          const receptorResponse = await fetch(receptorPath);
          if (!receptorResponse.ok) throw new Error(`Failed to load receptor: ${receptorPath}`);
          const receptorData = await receptorResponse.text();
          
          viewer.addModel(receptorData, receptorFile.split('.').pop());
          viewer.setStyle({ hetflag: false }, { cartoon: { color: 'yellow' } });
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
            const modelIndex = receptorFile ? i + 1 : i;

            const ligandFilename = ligandPath.split('/').pop();
            const pureLigandName = ligandFilename.replace('.pdbqt', '').split('_').pop();
            
            // Construct paths for supplementary files based on the correct ligand path
            const xyzPath = ligandPath.replace('/outputs/', '/xyz/').replace('.pdbqt', '.txt');
            const resultsPath = ligandPath.replace('/outputs/', '/results/').replace('.pdbqt', '.txt');

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
                // If no ENDMDL but contains ATOM records, treat the whole file as one model
                models.push(ligandData);
            } else if (models.length === 0) {
                console.error(`Viewer: Skipping ligand file ${ligandFilename}: No valid model data found.`);
                continue;
            }

            for (const modelContent of models) {
                const addedModel = viewer.addModel(modelContent, 'pdbqt');
                const modelId = addedModel.model_id; // Get the actual model ID from 3Dmol.js

                console.log(`Viewer: Ligand model from ${ligandFilename} added as 3Dmol model ID ${modelId}`);
                
                viewer.setStyle({ model: modelId }, { stick: { radius: 0.3 } });

                // Labeling logic - apply label only to the first model of the file
                if (models.indexOf(modelContent) === 0) {
                    if (xyzResponse && xyzResponse.ok && affinityResponse && affinityResponse.ok) {
                      const xyzText = await xyzResponse.text();
                      const affinityText = await affinityResponse.text();
                      
                      const xyz = xyzText.split(',');
                      const affinityLine = affinityText.split('\n')[0];
                      const affinity = affinityLine ? affinityLine.split(',')[1] : 'N/A';

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

            if (xyzResponse && xyzResponse.ok && affinityResponse && affinityResponse.ok) {
              const xyzText = await xyzResponse.text();
              const affinityText = await affinityResponse.text();
              
              const xyz = xyzText.split(',');
              const affinityLine = affinityText.split('\n')[0];
              const affinity = affinityLine ? affinityLine.split(',')[1] : 'N/A';

              if (xyz.length === 3) {
                const labelPos = { x: parseFloat(xyz[0]), y: parseFloat(xyz[1]), z: parseFloat(xyz[2]) };
                viewer.addLabel(
                  // `${pureLigandName}\nAffinity: ${affinity || 'N/A'} `,
                  `${pureLigandName}`,
                  {
                    position: labelPos,
                    // backgroundColor: 'white',
                    // fontColor: 'black',
                    backgroundColor: null,            // Set background color to null or ''
                    backgroundOpacity: 0.0,
                    fontColor: 'white',
                    fontSize: 14,
                    // border: `solid 1px black`,
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
                }, { model: modelIndex });
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

  }, [receptorFile, ligandFiles]);

  const handleZoomIn = () => {
    if (viewerRef.current) viewerRef.current.zoom(1.2);
  };

  const handleZoomOut = () => {
    if (viewerRef.current) viewerRef.current.zoom(1 / 1.2);
  };

  return (
    <div className="viewer-panel">
      <div ref={viewport} style={{ width: '100%', height: '100%' }}></div>
      {(receptorFile || (ligandFiles && ligandFiles.length > 0)) && (
        <div className="zoom-controls">
          <button onClick={handleZoomIn}>&#x2795;</button>
          <button onClick={handleZoomOut}>&#x2796;</button>
        </div>
      )}
    </div>
  );
}

export default Viewer;