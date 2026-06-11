import os
import sys
from pathlib import Path
import uvicorn
root = Path(__file__).resolve().parent
sys.path.append(str(root))
sys.path.append(str(root / "app"))
sys.path.append(str(root / "ml" / "src"))
print(f"Paths configured. Root: {root}")
if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
