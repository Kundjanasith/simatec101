import React, { useEffect, useRef } from 'react';
import * as $3Dmol from '3dmol';
import { proteinNameMapping } from './proteinData';

function ViewerMembrane({ ligandFiles }) {
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

  // Load proteins when props change
  useEffect(() => {
    if (!viewerRef.current) return;

    const viewer = viewerRef.current;
    viewer.clear();
    console.log("Viewer: Cleared. Loading new data.", { ligandFiles });

    // const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF'];
    // const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00']
    const loadData = async () => {
      try {
        if (ligandFiles && ligandFiles.length > 0) {
          console.log(`Viewer: Processing ${ligandFiles.length} protein(s).`);
          
          for (let i = 0; i < ligandFiles.length; i++) {
            const proteinPath = ligandFiles[i];
            if (typeof proteinPath !== 'string') {
                console.error("Viewer: Protein file path is not a string:", proteinPath);
                continue;
            }
            
            const proteinFilename = proteinPath.split('/').pop();
            console.log(`Viewer: Loading protein #${i + 1}: ${proteinFilename}`);
            
            const proteinResponse = await fetch(`${process.env.PUBLIC_URL}${proteinPath}`);
            if (!proteinResponse.ok) {
              console.error(`Viewer: Skipping protein ${proteinFilename}: Could not fetch PDB file at ${proteinPath}. Status: ${proteinResponse?.status}`);
              continue;
            }

            const proteinData = await proteinResponse.text();
            const addedModel = viewer.addModel(proteinData, 'pdb');
            const modelId = addedModel.model_id;
            // const color = colors[i % colors.length];
            var cc = '#FFFFFF'
            if (proteinFilename.includes('MUB2')){
                cc = '#FF0000'
            }
            if (proteinFilename.includes('MUBRV')){
                cc = '#00FF00'
            }
            if (proteinFilename.includes('NAGNAM')){
                cc = '#0000FF'
            }
            if (proteinFilename.includes('SRRP5')){
                cc = '#FFFF00'
            }
            viewer.setStyle({ model: addedModel.getID() }, { cartoon: { color: cc } });

            const model = viewer.getModel(modelId);
            const atoms = model.selectedAtoms({});
            let x = 0, y = 0, z = 0;
            for (let j = 0; j < atoms.length; j++) {
                x += atoms[j].x;
                y += atoms[j].y;
                z += atoms[j].z;
            }
            const center = { x: x / atoms.length, y: y / atoms.length, z: z / atoms.length };

            viewer.addLabel(proteinNameMapping[proteinFilename] || proteinFilename, { 
              position: center,
              inFront: true,
              fontSize: 14,
              fontColor: cc,
              backgroundColor: 'black',
              backgroundOpacity: 0.5
            });

            console.log(`Viewer: Displaying protein ${proteinFilename} as 3Dmol model ID ${modelId} with color ${cc}`);
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

  }, [ligandFiles]);

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