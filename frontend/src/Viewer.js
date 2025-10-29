
import React, { useEffect, useRef } from 'react';
import * as $3Dmol from '3dmol';

function Viewer({ receptorFile, ligandFile }) {
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
      // backgroundColor: '0x00000000' // Transparent background for 3Dmol viewer
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

  // Load receptor when receptorFile changes
  useEffect(() => {
    if (receptorFile && viewerRef.current) {
      const viewer = viewerRef.current;
      viewer.clear(); // Clear all models before loading new receptor

      console.log("Viewer: Loading receptor", receptorFile);
      fetch(receptorFile)
        .then(response => response.text())
        .then(data => {
          viewer.addModel(data, 'pdbqt');
          viewer.setStyle({model: -1}, {cartoon: {color: 'spectrum'}}); // Apply spectrum coloring
          viewer.zoomTo();
          viewer.render();
          viewer.spin(true); // Start spinning
          console.log("Viewer: Receptor loaded and rendered.");
        })
        .catch(e => console.error("Receptor loading error:", e));
    }
  }, [receptorFile]);

  // Load ligand when ligandFile changes
  useEffect(() => {
    if (ligandFile && viewerRef.current) {
      const viewer = viewerRef.current;
      
      // For simplicity, let's clear all and re-add receptor then ligand
      // This assumes receptorFile is always available when ligandFile changes
      if (receptorFile) {
        viewer.clear();
        fetch(receptorFile)
          .then(response => response.text())
          .then(data => {
            viewer.addModel(data, 'pdbqt');
            viewer.setStyle({model: -1}, {cartoon: {color: 'spectrum'}});
            console.log("Viewer: Receptor re-added for ligand loading.");

            console.log("Viewer: Loading ligand", ligandFile);
            fetch(ligandFile)
              .then(response => response.text())
              .then(data => {
                viewer.addModel(data, 'pdbqt');
                // Style all ligand models (models after receptor)
                // 3Dmol adds models sequentially, so ligand models will be after the receptor
                viewer.setStyle({model: -1}, {stick: {colorscheme: 'byelement'}}); // Stick representation, color by element
                viewer.zoomTo();
                viewer.render();
                viewer.spin(true); // Start spinning
                console.log("Viewer: Ligand loaded and rendered.");
              })
              .catch(e => console.error("Ligand loading error:", e));
          })
          .catch(e => console.error("Receptor re-adding error during ligand load:", e));
      } else {
        console.error("Viewer: Receptor file not available when trying to load ligand.");
      }
    }
  }, [ligandFile, receptorFile]); // Depend on receptorFile too for re-adding


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
      {(receptorFile || ligandFile) && (
        <div className="zoom-controls">
          <button onClick={handleZoomIn}>&#x2795;</button>
          <button onClick={handleZoomOut}>&#x2796;</button>
        </div>
      )}
    </div>
  );
}

export default Viewer;
