import React, { useEffect, useMemo, useRef, useState } from "react";
import * as $3Dmol from "3dmol";

export default function MicelleViewer3DMol({ micelleData, frameIndex, onFrameChange }) {
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const nFrames = useMemo(() => {
    if (!micelleData?.times) return 0;
    return micelleData.times.length;
  }, [micelleData]);

  // Init viewer once
  useEffect(() => {
    if (!containerRef.current) return;
    if (viewerRef.current) return;

    viewerRef.current = $3Dmol.createViewer(containerRef.current, {
      backgroundColor: "white",
    });
  }, []);

  // Load model when micelleData changes
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !micelleData?.multiframe_pdb) return;

    viewer.removeAllModels();
    viewer.removeAllShapes();
    viewer.addModel(micelleData.multiframe_pdb, "pdb"); // multi-model PDB (MODEL/ENDMDL)

    // Style: micelle atoms (if you have protein+surfactant, adjust selections)
    viewer.setStyle({}, { stick: { radius: 0.18 } });

    viewer.zoomTo();
    viewer.render();

    // reset frame
    onFrameChange(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [micelleData]);

  // Set frame when frameIndex changes
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || nFrames === 0) return;

    const fi = Math.max(0, Math.min(frameIndex, nFrames - 1));
    viewer.setFrame(fi);
    viewer.render();
  }, [frameIndex, nFrames]);

  // Play loop
  useEffect(() => {
    if (!isPlaying || nFrames === 0) return;

    const timer = setInterval(() => {
      onFrameChange((prev) => (prev + 1) % nFrames);
    }, 120);

    return () => clearInterval(timer);
  }, [isPlaying, nFrames, onFrameChange]);

  return (
    <div style={{ flex: 1, padding: 10 }}>
      <div
        style={{
          background: "#111827",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,.35)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 12px",
            color: "white",
            borderBottom: "1px solid rgba(255,255,255,.08)",
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: 700 }}>3D Micelle Viewer</div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>
            {nFrames ? `Frame ${frameIndex} / ${nFrames - 1}` : "No data"}
          </div>
        </div>

        <div ref={containerRef} style={{ width: "100%", height: 520 }} />

        <div style={{ padding: "10px 12px", color: "white" }}>
          {nFrames ? (
            <>
              <input
                type="range"
                min={0}
                max={nFrames - 1}
                value={frameIndex}
                onChange={(e) => onFrameChange(parseInt(e.target.value, 10))}
                style={{ width: "100%" }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button onClick={() => setIsPlaying(true)}>Play</button>
                <button onClick={() => setIsPlaying(false)}>Pause</button>
                <button
                  onClick={() => {
                    const v = viewerRef.current;
                    if (!v) return;
                    v.zoomTo();
                    v.render();
                  }}
                >
                  Zoom
                </button>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, opacity: 0.9 }}>
              Run analysis from the left panel to load frames.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
