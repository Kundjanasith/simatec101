
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

      if (receptorFile) {
        console.log("Viewer: Loading receptor", receptorFile);
        fetch(receptorFile)
          .then(response => response.text())
          .then(data => {
            viewer.addModel(data, 'pdbqt');
            viewer.setStyle({model: -1}, {cartoon: {color: 'spectrum'}}); // Apply spectrum coloring
            viewer.zoomTo();
            viewer.render();
            // viewer.spin(false); // Start spinning
            viewer.spin(true);
            console.log("Viewer: Receptor loaded and rendered.");

            if (ligandFiles && ligandFiles.length > 0) {
              let modelIndex = 1; // Start after the receptor (model 0)
              ligandFiles.forEach(ligand => {
                console.log("Viewer: Loading ligand", ligand);
                fetch(ligand)
                  .then(response => response.text())
                  .then(data => {
                    viewer.addModel(data, 'pdbqt');
                    viewer.setStyle({model: modelIndex}, {stick: {colorscheme: 'byelement'}}); // Style ligand
                    modelIndex++;
                    viewer.zoomTo();
                    viewer.render();
                    console.log("Viewer: Ligand loaded and rendered.");
                  })
                  .catch(e => console.error("Ligand loading error:", e));
              });
            }
          })
          .catch(e => console.error("Receptor loading error:", e));
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