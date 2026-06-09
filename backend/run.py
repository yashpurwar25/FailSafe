import os
import sys
from pathlib import Path
import uvicorn

# 1. Get the absolute path to the backend folder
root = Path(__file__).resolve().parent

# 2. Force Python to look in the 'app' folder AND the 'ml/src' folder
# This solves ALL "ModuleNotFoundError" issues instantly
sys.path.append(str(root))
sys.path.append(str(root / "app"))
sys.path.append(str(root / "ml" / "src"))

print(f"🚀 Paths configured. Root: {root}")

if __name__ == "__main__":
    # Run the app using the absolute path to the main object
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)