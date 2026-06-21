"""Generate .xlsx versions of the sample CSVs (for drag-and-drop demos).

Usage:  python sample_data/generate_xlsx.py
Requires: pandas, openpyxl (already in backend/requirements.txt).
"""
import os

import pandas as pd

HERE = os.path.dirname(__file__)

for name in ("inventory_sample", "suppliers_sample"):
    df = pd.read_csv(os.path.join(HERE, f"{name}.csv"))
    out = os.path.join(HERE, f"{name}.xlsx")
    df.to_excel(out, index=False)
    print(f"wrote {out}")
