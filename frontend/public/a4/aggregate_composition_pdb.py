#!/usr/bin/env python3
"""
aggregate_counter_pdb.py

Detect aggregated molecule clusters per timeframe (PDB MODEL frames).

Default assumption:
- Each RESIDUE (chain + resseq + icode) is a "molecule".
- Two molecules are "aggregated" (connected) if ANY atom pair distance <= cutoff.

Outputs per frame:
- number of aggregates (connected components)
- aggregate size distribution

Example:
  python3 aggregate_counter_pdb.py /mnt/data/C8C10C12_112_multiframe.pdb \
    --cutoff 4.5 --heavy_only --out aggregates.csv
"""

import argparse
import math
import csv
from collections import defaultdict, deque

# ---------- PDB parsing (supports MODEL/ENDMDL) ----------

def iter_pdb_frames(pdb_path):
    """
    Yields frames; each frame is a list of atom records.
    Atom record: (chain, resseq, icode, resname, atomname, element, x,y,z)
    """
    atoms = []
    in_model = False
    saw_model_records = False

    def flush():
        nonlocal atoms
        if atoms:
            yield atoms
            atoms = []

    with open(pdb_path, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            rec = line[0:6].strip()

            if rec == "MODEL":
                saw_model_records = True
                in_model = True
                # start new model; atoms list should already be empty or flushed at ENDMDL
                continue

            if rec == "ENDMDL":
                in_model = False
                # yield this model
                for fr in flush():
                    yield fr
                continue

            if rec not in ("ATOM", "HETATM"):
                continue

            # If no MODEL records exist, treat whole file as single frame
            # If MODEL exists, only capture while in_model=True
            if saw_model_records and not in_model:
                continue

            # PDB columns (1-indexed):
            # atomname 13-16, resname 18-20, chain 22, resseq 23-26, icode 27
            # x 31-38, y 39-46, z 47-54, element 77-78 (optional)
            atomname = line[12:16].strip()
            resname  = line[17:20].strip()
            chain    = line[21].strip() or "_"
            resseq_s = line[22:26].strip()
            icode    = line[26].strip() or ""
            try:
                resseq = int(resseq_s)
            except ValueError:
                # fallback if weird formatting
                resseq = 0

            try:
                x = float(line[30:38])
                y = float(line[38:46])
                z = float(line[46:54])
            except ValueError:
                continue

            element = line[76:78].strip()
            if not element:
                # crude fallback from atomname
                element = "".join([c for c in atomname if c.isalpha()])[:2].title()

            atoms.append((chain, resseq, icode, resname, atomname, element, x, y, z))

    # EOF flush
    if atoms:
        yield atoms


# ---------- clustering logic ----------

def is_heavy(element):
    # treat H / D as hydrogen
    e = element.strip().upper()
    return e not in ("H", "D")

def dist2(a, b):
    dx = a[0] - b[0]
    dy = a[1] - b[1]
    dz = a[2] - b[2]
    return dx*dx + dy*dy + dz*dz

def build_molecules(frame_atoms, heavy_only=False, atomname_allow=None):
    """
    Group atoms into molecules (residues).
    molecule_id = (chain, resseq, icode, resname)
    Returns:
      mol_ids: list of molecule ids (stable order)
      mol_atoms: list[list[ (x,y,z) ]] atoms coords for each molecule
    """
    mol_map = defaultdict(list)

    allow_set = None
    if atomname_allow:
        allow_set = set([x.strip().upper() for x in atomname_allow])

    for (chain, resseq, icode, resname, atomname, element, x, y, z) in frame_atoms:
        if heavy_only and not is_heavy(element):
            continue
        if allow_set is not None and atomname.strip().upper() not in allow_set:
            continue

        mol_id = (chain, resseq, icode, resname)
        mol_map[mol_id].append((x, y, z))

    mol_ids = sorted(mol_map.keys(), key=lambda t: (t[0], t[1], t[2], t[3]))
    mol_atoms = [mol_map[mid] for mid in mol_ids]
    return mol_ids, mol_atoms

def molecules_in_contact(atoms_a, atoms_b, cutoff2):
    # exact min atom-atom distance test
    for pa in atoms_a:
        for pb in atoms_b:
            if dist2(pa, pb) <= cutoff2:
                return True
    return False

def find_aggregates(mol_atoms, cutoff):
    """
    Build adjacency by distance cutoff and return connected components sizes.
    Brute-force O(M^2 * Na*Nb) but OK for ~100 molecules.
    """
    m = len(mol_atoms)
    cutoff2 = cutoff * cutoff

    adj = [[] for _ in range(m)]
    for i in range(m):
        ai = mol_atoms[i]
        if not ai:
            continue
        for j in range(i + 1, m):
            aj = mol_atoms[j]
            if not aj:
                continue
            if molecules_in_contact(ai, aj, cutoff2):
                adj[i].append(j)
                adj[j].append(i)

    # connected components (BFS)
    seen = [False] * m
    comp_sizes = []
    for i in range(m):
        if seen[i]:
            continue
        # isolated molecules still count as size-1 aggregates
        q = deque([i])
        seen[i] = True
        size = 0
        while q:
            u = q.popleft()
            size += 1
            for v in adj[u]:
                if not seen[v]:
                    seen[v] = True
                    q.append(v)
        comp_sizes.append(size)

    comp_sizes.sort(reverse=True)
    return comp_sizes


# ---------- main ----------

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pdb", help="Multi-frame PDB with MODEL/ENDMDL (or single-frame).")
    ap.add_argument("--cutoff", type=float, default=4.5, help="Contact cutoff distance in Angstrom. Default 4.5")
    ap.add_argument("--heavy_only", action="store_true", help="Ignore hydrogens (H/D).")
    ap.add_argument("--atomname", nargs="*", default=None,
                    help="Optional: only consider these atom names (e.g., --atomname C1 C2 O1).")
    args = ap.parse_args()

    rows = []
    for frame_idx, frame_atoms in enumerate(iter_pdb_frames(args.pdb), start=1):
        mol_ids, mol_atoms = build_molecules(frame_atoms, heavy_only=args.heavy_only, atomname_allow=args.atomname)
        comp_sizes = find_aggregates(mol_atoms, cutoff=args.cutoff)

        row = {
            "frame": frame_idx,
            "n_molecules": len(mol_ids),
            "n_aggregates": len(comp_sizes),
            "largest_aggregate": comp_sizes[0] if comp_sizes else 0,
            "sizes_sorted": " ".join(map(str, comp_sizes)),
        }
        rows.append(row)

        print(
            f"Frame {frame_idx:4d}: molecules={row['n_molecules']:4d} "
            f"aggregates={row['n_aggregates']:4d} largest={row['largest_aggregate']:4d} "
            f"sizes=[{row['sizes_sorted']}]"
        )

    # write CSV
    with open(args.out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["frame", "n_molecules", "n_aggregates", "largest_aggregate", "sizes_sorted"])
        w.writeheader()
        w.writerows(rows)

    print(f"\n[OK] Wrote: {args.out}")

if __name__ == "__main__":
    main()

# python3 aggregate_composition_pdb.py mixed_C8C10C12/C8C10C12_112_multiframe.pdb \
#   --cutoff 10 --heavy_only \
#   --clusters-out mixed_C8C10C12/C8C10C12_112_cluster_composition.csv \
#   --summary-out mixed_C8C10C12/C8C10C12_112_frame_summary.csv