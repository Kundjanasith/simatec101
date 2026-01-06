#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
from pathlib import Path
import numpy as np

import MDAnalysis as mda

# CHANGE THESE if needed
PDB_IN = "C12.pdb"
XTC_IN = "C12_skip.xtc"     # your file name
OUT_DIR = Path(".")

# Controls
STRIDE = 5          # keep HTML fast: take every 5th frame
USE_ALL_ATOMS = True  # if you want protein-only, change selection below

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    u = mda.Universe(PDB_IN, XTC_IN)

    # Choose atoms for micelle metrics / visualization
    if USE_ALL_ATOMS:
        sel = u.atoms
    else:
        # example: protein only
        sel = u.select_atoms("protein")

    multiframe_pdb = OUT_DIR / "C12_multiframe.pdb"
    metrics_json = OUT_DIR / "C12_metrics.json"

    frames = list(range(0, len(u.trajectory), STRIDE))

    times = []
    cx = []; cy = []; cz = []
    rg = []
    rgx = []; rgy = []; rgz = []

    # Write multiframe PDB (MODEL/ENDMDL) for 3Dmol
    with mda.Writer(str(multiframe_pdb), multiframe=True) as W:
        for fi in frames:
            u.trajectory[fi]
            pos = sel.positions.astype(np.float64)

            # center of geometry
            c = pos.mean(axis=0)
            X = pos - c

            # gyration tensor (lab frame)
            G = (X.T @ X) / pos.shape[0]
            diag = np.sqrt(np.maximum(np.diag(G), 0.0))

            t = float(u.trajectory.time) if hasattr(u.trajectory, "time") else float(fi)

            times.append(t)
            cx.append(float(c[0])); cy.append(float(c[1])); cz.append(float(c[2]))
            rg.append(float(np.sqrt(np.trace(G))))
            rgx.append(float(diag[0])); rgy.append(float(diag[1])); rgz.append(float(diag[2]))

            # write coordinates for this frame
            W.write(sel)

    payload = {
        "name": "C12",
        "stride": STRIDE,
        "n_frames": len(frames),
        "times": times,
        "cx": cx, "cy": cy, "cz": cz,
        "rg": rg,
        "rgx": rgx, "rgy": rgy, "rgz": rgz,
    }
    metrics_json.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    print("Wrote:", multiframe_pdb)
    print("Wrote:", metrics_json)
    print("Frames:", len(frames))

if __name__ == "__main__":
    main()
