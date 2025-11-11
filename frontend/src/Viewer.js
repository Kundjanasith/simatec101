
import React, { useEffect, useRef } from 'react';
import * as $3Dmol from '3dmol';

function Viewer({ receptorFile, ligandFiles }) {
  const viewport = useRef(null);
  const viewerRef = useRef(null);

  // Initialize 3Dmol viewer once
  useEffect(() => {
    console.log("Viewer: Initializing 3Dmol viewer effect.");
    if (!viewport.current) {
      console.error("Viewer: viewport.current is null during initial 3Dmol setup.");
      return;
    }
    console.log("Viewer: viewport.current exists.", viewport.current);
    console.log("Viewer: Viewport dimensions before 3Dmol init:", viewport.current.offsetWidth, viewport.current.offsetHeight);

    viewerRef.current = $3Dmol.createViewer(viewport.current, { 
      defaultcolors: $3Dmol.rasmolAmino, // Default coloring for amino acids
      // backgroundColor: '1565c0'
      backgroundAlpha: 0

    });
    const viewer = viewerRef.current;
    console.log("Viewer: 3Dmol Viewer initialized.", viewer);

    const handleResize = () => {
      console.log("Viewer: Handling resize.");
      viewer.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      console.log("Viewer: Disposing 3Dmol viewer effect.");
      window.removeEventListener('resize', handleResize);
      if (viewerRef.current && typeof viewerRef.current.destroy === 'function') {
        viewerRef.current.destroy(); // Use destroy for 3Dmol viewer
        viewerRef.current = null; // Clear the ref after destroying
      }
    };
  }, []);

  // Load receptor and ligand
  useEffect(() => {
    if (viewerRef.current) {
      const viewer = viewerRef.current;
      viewer.clear();

      console.log("Viewer useEffect: receptorFile:", receptorFile);
      console.log("Viewer useEffect: ligandFiles:", ligandFiles);

      let loadPromises = [];

      if (receptorFile) {
        // Load receptor
        console.log("Viewer: Fetching receptor:", process.env.PUBLIC_URL + receptorFile);
        const receptorPromise = fetch(process.env.PUBLIC_URL + receptorFile)
          .then(response => {
            console.log("Viewer: Receptor fetch response status:", response.status);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
          })
          .then(data => {
            console.log("Viewer: Successfully fetched receptor data.");
            viewer.addModel(data, 'pdbqt');
            viewer.setStyle({ model: 0 }, { cartoon: { color: 'yellow' } });
          })
          .catch(e => console.error("Viewer: Error fetching receptor:", e));
        loadPromises.push(receptorPromise);
      }

      // Load ligands (or docked complexes)
      if (ligandFiles && ligandFiles.length > 0) {
        ligandFiles.forEach((ligandFile, index) => {
          console.log("Viewer: Fetching ligand/complex:", process.env.PUBLIC_URL + ligandFile);
          const ligandPromise = fetch(process.env.PUBLIC_URL + ligandFile)
            .then(response => {
              console.log("Viewer: Ligand/complex fetch response status:", response.status);
              if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
              return response.text();
            })
            .then(data => {
              console.log("Viewer: Successfully fetched ligand/complex data for:", ligandFile);
              console.log("Viewer: Fetched data content (first 500 chars):", data.substring(0, 500));
              const modelIndex = receptorFile ? index + 1 : index;

              let modelData = data;
              const lines = data.split('\n');
              if (lines.some(line => line.startsWith('MODEL 1'))) {
                let model1Content = '';
                let inModel1 = false;
                for (const line of lines) {
                  if (line.startsWith('MODEL 1')) {
                    inModel1 = true;
                  }
                  if (inModel1) {
                    model1Content += line + '\n';
                  }
                  if (inModel1 && line.startsWith('ENDMDL')) {
                    break;
                  }
                }
                modelData = model1Content;
              }
              
              viewer.addModel(modelData, 'pdbqt');
              
              const addedModel = viewer.getModel(modelIndex);
              if (!addedModel) {
                console.error(`Viewer: Failed to add model at index ${modelIndex} for file ${ligandFile}. Data might be invalid.`);
                return; // Stop processing if model wasn't added
              }
              console.log(`Viewer: Model successfully added at index ${modelIndex} for file ${ligandFile}.`);

              try {
                if (receptorFile) {
                  // Separate receptor and ligand files
                  viewer.setStyle({ model: modelIndex }, { stick: { colorscheme: 'default' } });
                  const ligandName = ligandFile.split('/').pop().replace('.pdbqt', '');
                  viewer.addLabel(ligandName, {
                    font: 'sans-serif',
                    fontSize: 14,
                    fontColor: 'black',
                    backgroundColor: 'white',
                    backgroundOpacity: 0.8,
                    borderThickness: 1,
                    borderColor: 'black',
                  }, { model: modelIndex });
                } else {
                  // Docked complex file (protein + ligand)
                  viewer.setStyle({ model: modelIndex }, { cartoon: { color: 'spectrum' } });
                  viewer.setStyle({ model: modelIndex, hetflag: true }, { stick: { colorscheme: 'default' } });

                  const atomLines = modelData.split('\n').filter(line => line.startsWith('ATOM') || line.startsWith('HETATM'));
                  const atoms = atomLines.map(line => {
                    const serial = parseInt(line.substring(6, 11));
                    const x = parseFloat(line.substring(30, 38));
                    const y = parseFloat(line.substring(38, 46));
                    const z = parseFloat(line.substring(46, 54));
                    return { serial, x, y, z };
                  }).filter(atom => !isNaN(atom.x) && !isNaN(atom.y) && !isNaN(atom.z));


                  if (atoms.length > 0) {
                    let sumX = 0, sumY = 0, sumZ = 0;
                    atoms.forEach(atom => {
                      sumX += atom.x;
                      sumY += atom.y;
                      sumZ += atom.z;
                    });
                    const centerX = sumX / atoms.length;
                    const centerY = sumY / atoms.length;
                    const centerZ = sumZ / atoms.length;

                    let closestAtom = null;
                    let minDistance = Infinity;

                    atoms.forEach(atom => {
                      const dist = Math.sqrt(Math.pow(atom.x - centerX, 2) + Math.pow(atom.y - centerY, 2) + Math.pow(atom.z - centerZ, 2));
                      if (dist < minDistance) {
                        minDistance = dist;
                        closestAtom = atom;
                      }
                    });

                    if (closestAtom) {
                      viewer.addLabel("Best Residual", {
                        font: 'sans-serif',
                        fontSize: 18,
                        fontColor: 'black',
                        backgroundColor: 'white',
                        backgroundOpacity: 0.9,
                      }, { model: modelIndex, serial: closestAtom.serial });
                    }
                  } else {
                    const ligandName = ligandFile.split('/').pop().replace('.pdbqt', '').split('_').pop();
                    viewer.addLabel(ligandName, {
                      font: 'sans-serif',
                      fontSize: 14,
                      fontColor: 'black',
                      backgroundColor: 'white',
                      backgroundOpacity: 0.8,
                      borderThickness: 1,
                      borderColor: 'black',
                    }, { model: modelIndex, hetflag: true });
                  }
                }
              } catch (styleError) {
                console.error("Viewer: Error applying style or label to model:", styleError);
              }
            })
            .catch(e => console.error("Viewer: Error fetching ligand/complex (outer catch):", e));
          loadPromises.push(ligandPromise);
        });
      }

      // Wait for all models to load, then zoom and render
      if (loadPromises.length > 0) {
        Promise.all(loadPromises).then(() => {
          viewer.zoomTo();
          viewer.render();
          viewer.spin(true);
        }).catch(e => console.error("Loading error:", e));
      } else {
        viewer.render(); // Render even if there's nothing to load, to show a clear canvas
      }
    }
  }, [receptorFile, ligandFiles]);


  const handleZoomIn = () => {
    if (viewerRef.current) {
      viewerRef.current.zoom(1.2);
      viewerRef.current.render();
    }
  };

  const handleZoomOut = () => {
    if (viewerRef.current) {
      viewerRef.current.zoom(1 / 1.2);
      viewerRef.current.render();
    }
  };

  return (
    <div className="viewer-panel">
      <div ref={viewport} style={{ width: '100%', height: '100%'}}></div>
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