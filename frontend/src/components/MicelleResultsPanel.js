import React, { useEffect, useMemo, useRef } from "react";
import Chart from "chart.js/auto";

export default function MicelleResultsPanel({ micelleData, frameIndex, error }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const nFrames = micelleData?.times?.length ?? 0;

  const current = useMemo(() => {
    if (!micelleData || nFrames === 0) return null;
    const i = Math.max(0, Math.min(frameIndex, nFrames - 1));
    return {
      time: micelleData.times[i],
      cx: micelleData.cx[i],
      cy: micelleData.cy[i],
      cz: micelleData.cz[i],
      rg: micelleData.rg[i],
      rgx: micelleData.rgx[i],
      rgy: micelleData.rgy[i],
      rgz: micelleData.rgz[i],
    };
  }, [micelleData, frameIndex, nFrames]);

  // Build chart once, update data when micelleData changes
  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy old
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    if (!micelleData || nFrames === 0) return;

    const labels = micelleData.times.map((t, i) => i); // frame index (or use time)
    const ctx = chartRef.current.getContext("2d");

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "Rg total", data: micelleData.rg, borderWidth: 2, pointRadius: 0 },
          { label: "Rg x", data: micelleData.rgx, borderWidth: 1.5, pointRadius: 0 },
          { label: "Rg y", data: micelleData.rgy, borderWidth: 1.5, pointRadius: 0 },
          { label: "Rg z", data: micelleData.rgz, borderWidth: 1.5, pointRadius: 0 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { display: true } },
        scales: {
          x: { title: { display: true, text: "Frame index" } },
          y: { title: { display: true, text: "Å" } },
        },
      },
    });
  }, [micelleData, nFrames]);

  return (
    <div style={{ width: 380, padding: 10 }}>
      <div
        style={{
          background: "#111827",
          borderRadius: 14,
          padding: 12,
          color: "white",
          boxShadow: "0 10px 30px rgba(0,0,0,.35)",
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Micelle Results</div>

        {error && (
          <div style={{ background: "rgba(255,0,0,.15)", padding: 10, borderRadius: 10, marginBottom: 10 }}>
            {error}
          </div>
        )}

        {!micelleData ? (
          <div style={{ fontSize: 13, opacity: 0.9 }}>
            Run analysis to show micelle stability metrics (cx, cy, cz, Rg…).
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 10 }}>
              Frame: {frameIndex} / {nFrames - 1} • time: {current?.time?.toFixed?.(3)} ps
            </div>

            {/* Numbers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Stat k="cx (Å)" v={current?.cx} />
              <Stat k="cy (Å)" v={current?.cy} />
              <Stat k="cz (Å)" v={current?.cz} />
              <Stat k="Rg total (Å)" v={current?.rg} />
              <Stat k="Rg x (Å)" v={current?.rgx} />
              <Stat k="Rg y (Å)" v={current?.rgy} />
              <Stat k="Rg z (Å)" v={current?.rgz} />
            </div>

            {/* Chart */}
            <div style={{ height: 260, marginTop: 14 }}>
              <canvas ref={chartRef} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ k, v }) {
  const value = Number.isFinite(v) ? v.toFixed(3) : "-";
  return (
    <div style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: 10 }}>
      <div style={{ fontSize: 12, opacity: 0.8 }}>{k}</div>
      <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>{value}</div>
    </div>
  );
}
