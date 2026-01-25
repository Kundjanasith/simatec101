import React, { useEffect, useRef } from 'react';
import * as $3Dmol from '3dmol';
import { proteinNameMapping } from './proteinData';

function addMultiColorLabel(viewer, center, proteinText, ligandText, proteinColor, ligandColor) {
  const fullText = `${proteinText} - ${ligandText}`;

  // crude width estimate in "world units": adjust if needed
  const charW = 0.55;   // spacing per character (tune)
  const yOffset = 0;    // keep same
  const zOffset = 0;    // keep same

  const proteinStr = proteinText;
  const dashStr = " - ";
  const ligandStr = ligandText;

  const totalLen = proteinStr.length + dashStr.length + ligandStr.length;

  // start x so that the whole string is centered at `center`
  const startX = center.x - (totalLen * charW) / 2;

  const pX = startX + (proteinStr.length * charW) / 2;
  const dX = startX + (proteinStr.length * charW) + (dashStr.length * charW) / 2;
  const lX = startX + ((proteinStr.length + dashStr.length) * charW) + (ligandStr.length * charW) / 2;

  const common = {
    inFront: true,
    fontSize: 14,
    backgroundColor: "black",
    backgroundOpacity: 0.5,
  };

  viewer.addLabel(proteinStr.split('-')[0], {
    ...common,
    position: { x: pX, y: center.y + yOffset, z: center.z + zOffset },
    fontColor: proteinColor,
  });

  // viewer.addLabel(dashStr, {
  //   ...common,
  //   position: { x: dX, y: center.y + yOffset, z: center.z + zOffset },
  //   fontColor: "#ffffff", // dash is white
  // });

  viewer.addLabel(ligandStr, {
    ...common,
    position: { x: lX, y: center.y + yOffset, z: center.z + zOffset },
    fontColor: ligandColor,
  });
}

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
            // Define protein colors
            let proteinColor = '#FFFFFF'; // Default
            if (proteinFilename.includes('8Sa-globulin')) {
                proteinColor = '#FF0000'; // Red for 8s
            } else if (proteinFilename.includes('7S-globulin')) {
                proteinColor = '#00FF00'; // Green for 7s
            } else if (proteinFilename.includes('11S-legumin')) {
                proteinColor = '#0000FF'; // Blue for 11s
            } else if (proteinFilename.includes('B-lactoglobulin')) {
                proteinColor = '#FFFF00'; // Yellow for BLG
            }

            // Define ligand colors and identify ligand residue name
            let ligandColor = '#FFFFFF'; // Default
            let ligandResidueName = '';
            if (proteinFilename.includes('MUB2')) {
                ligandColor = '#FF00FF'; // Magenta for MUB2
                ligandResidueName = 'MUB2';
            } else if (proteinFilename.includes('MUBRV')) {
                ligandColor = '#00FFFF'; // Cyan for MUBRV
                ligandResidueName = 'MUBRV';
            } else if (proteinFilename.includes('NAGNAM')) {
                ligandColor = '#FFA500'; // Orange for NAGNAM
                ligandResidueName = 'NAGNAM';
            } else if (proteinFilename.includes('SRRP5')) {
                ligandColor = '#800080'; // Purple for SRRP5
                ligandResidueName = 'SRRP5';
            }

            const atomsX = addedModel.selectedAtoms({});
            const residues = new Map();
            atomsX.forEach(a => {
              // unique residue key: chain + resi + insertion code
              const key = `${a.chain}_${a.resi}_${a.icode || ''}`;

              if (!residues.has(key)) {
                residues.set(key, {
                  chain: a.chain,
                  resi: a.resi,
                  resn: a.resn,
                  hetflag: a.hetflag
                });
              }
            });

            const residueList = Array.from(residues.values());

            // console.log("All residues:", residueList);
            if (proteinFilename.includes('8S') || proteinFilename.includes('7S')){
              for (const proT of residueList){
                if (proT.chain === 'A' || proT.chain === 'B' || proT.chain === 'C'){
                  // console.log("Protein residue found:", proT);
                  viewer.setStyle(
                    { chain: proT.chain},
                    { cartoon: { color: proteinColor}}
                  );
                }
                else{
                  // console.log("Ligands residue found:", proT);
                  viewer.setStyle(
                  { chain: proT.chain},
                  { stick: { color: ligandColor }}
                );
                }
              }
          }
          if (proteinFilename.includes('11S')){
              for (const proT of residueList){
                if (proT.chain === 'A' || proT.chain === 'B' || proT.chain === 'C' || proT.chain === 'D' || proT.chain === 'E' || proT.chain === 'F'){
                  // console.log("Protein residue found:", proT);
                  viewer.setStyle(
                    { chain: proT.chain},
                    { cartoon: { color: proteinColor}}
                  );
                }
                else{
                  // console.log("Ligands residue found:", proT);
                  viewer.setStyle(
                  { chain: proT.chain},
                  { stick: { color: ligandColor }}
                );
                }
              }
          }
          if (proteinFilename.includes('Whey')){
              for (const proT of residueList){
                if (proT.chain === 'A'){
                  // console.log("Protein residue found:", proT);
                  viewer.setStyle(
                    { chain: proT.chain},
                    { cartoon: { color: proteinColor}}
                  );
                }
                else{
                  // console.log("Ligands residue found:", proT);
                  viewer.setStyle(
                  { chain: proT.chain},
                  { stick: { color: ligandColor}}
                );
                }
              }
          }


            // // Define standard amino acids for selection
            // const standardAminoAcids = [
            //   'ALA', 'GLY', 'VAL', 'LEU', 'ILE', 'SER', 'THR', 'ASP', 'GLU', 'LYS', 'ARG', 'HIS', 'PHE', 'TYR', 'TRP', 'PRO', 'CYS', 'MET', 'ASN', 'GLN'
            // ];

            // viewer.setStyle({}, {});

            // for (const pp_tem of standardAminoAcids ){
            //   // console.log(pp_tem)
            //   viewer.setStyle(
            //     { resn: pp_tem},
            //     { cartoon: { color: proteinColor} }
            //   );
            // }
            // const atomsX = addedModel.selectedAtoms({});
            // const residues = new Map();
            // atomsX.forEach(a => {
            //   // unique residue key: chain + resi + insertion code
            //   const key = `${a.chain}_${a.resi}_${a.icode || ''}`;

            //   if (!residues.has(key)) {
            //     residues.set(key, {
            //       chain: a.chain,
            //       resi: a.resi,
            //       resn: a.resn,
            //       hetflag: a.hetflag
            //     });
            //   }
            // });

            // const residueList = Array.from(residues.values());

            // console.log("All residues:", residueList);
            // for (const pp_tem of residueList){
            //   if (standardAminoAcids.includes(pp_tem.resn)){
            //     console.log("Protein residue found:", pp_tem);
            //   }
            //   else{
            //     console.log("Ligands residue found:", pp_tem);
            //     viewer.setStyle(
            //     { resn: pp_tem},
            //     { stick: { color: ligandColor }}
            //   );
            //   }
            // }


            // Apply style to protein part (residues that are standard amino acids)
            // viewer.setStyle({ model: modelId, resn: standardAminoAcids }, { cartoon: { color: proteinColor } });

            // Apply style to ligand part (residues that are NOT standard amino acids)
            // viewer.setStyle({ model: modelId, resn: standardAminoAcids, invert: true }, { stick: { color: ligandColor } });

            const model = viewer.getModel(modelId);
            const atoms = model.selectedAtoms({});
            let x = 0, y = 0, z = 0;
            for (let j = 0; j < atoms.length; j++) {
                x += atoms[j].x;
                y += atoms[j].y;
                z += atoms[j].z;
            }
            const center = { x: x / atoms.length, y: y / atoms.length, z: z / atoms.length };

            // viewer.addLabel(proteinNameMapping[proteinFilename] || proteinFilename, { 
            //   position: center,
            //   inFront: true,
            //   fontSize: 14,
            //   fontColor: proteinColor,
            //   backgroundColor: 'black',
            //   backgroundOpacity: 0.5
            // });
            const proteinLabel = proteinNameMapping[proteinFilename] || proteinFilename;
            const ligandLabel = ligandResidueName || "Ligand";
            addMultiColorLabel(viewer, center, proteinLabel, ligandLabel, proteinColor, ligandColor);

            console.log(`Viewer: Displaying protein ${proteinFilename} as 3Dmol model ID ${modelId} with protein color ${proteinColor} and ligand color ${ligandColor}`);
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