import importlib.util
import sys
import subprocess

REQUIRED = ["fastapi", "uvicorn", "supabase", "dotenv"]
missing = []

for pkg in REQUIRED:
    if importlib.util.find_spec(pkg) is None:
        missing.append(pkg)

if missing:
    print("[ERROR] The following required packages are missing:")
    for pkg in missing:
        print(f"  - {pkg}")
    print("\nPlease install them with:")
    print(f"pip install {' '.join(missing)}")
    sys.exit(1)

print("[INFO] All dependencies found. Starting FastAPI server...")
print("[INFO] You can stop the server with Ctrl+C.")

subprocess.run([sys.executable, "-m", "uvicorn",
               "main:app", "--reload", "--port", "8001"])
