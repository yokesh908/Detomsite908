"""
Static deployment readiness check for DETOMSITE.
"""
from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text()


def has_all(text: str, names: list[str]) -> list[str]:
    return [name for name in names if name not in text]


def main() -> int:
    checks: list[tuple[str, bool, str]] = []

    required_env = ["MONGODB_URL", "DATABASE_NAME", "JWT_SECRET", "FRONTEND_URL", "BACKEND_URL"]
    root_env = read(".env.example")
    backend_env = read("backend/.env.example")
    checks.append((".env.example has required variables", not has_all(root_env, required_env), ", ".join(has_all(root_env, required_env))))
    checks.append(("backend/.env.example has required variables", not has_all(backend_env, required_env), ", ".join(has_all(backend_env, required_env))))

    backend_vercel = json.loads(read("backend/vercel.json"))
    frontend_vercel = json.loads(read("frontend/vercel.json"))
    backend_env_keys = backend_vercel.get("env", {})
    checks.append(("backend vercel.json sets USE_LOCAL_DB False", backend_env_keys.get("USE_LOCAL_DB") == "False", "USE_LOCAL_DB missing or not False"))
    checks.append(("backend vercel.json references JWT_SECRET", "JWT_SECRET" in backend_env_keys, "JWT_SECRET missing"))
    checks.append(("frontend vercel.json has SPA rewrites", bool(frontend_vercel.get("rewrites")), "rewrites missing"))
    checks.append(("frontend vercel.json references VITE_API_URL", "VITE_API_URL" in frontend_vercel.get("env", {}), "VITE_API_URL missing"))

    requirements = read("backend/requirements.txt")
    checks.append(("backend requirements include MongoDB drivers", all(name in requirements for name in ["motor", "pymongo", "beanie"]), "motor/pymongo/beanie missing"))
    checks.append(("Mongo store exists", (ROOT / "backend/app/core/local_mongo_db.py").exists(), "local_mongo_db.py missing"))
    checks.append(("Deployment guide exists", (ROOT / "DEPLOYMENT_GUIDE.md").exists(), "DEPLOYMENT_GUIDE.md missing"))

    failed = False
    for label, ok, detail in checks:
        status = "OK" if ok else "FAIL"
        print(f"{status}: {label}")
        if not ok:
            failed = True
            if detail:
                print(f"  {detail}")

    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
