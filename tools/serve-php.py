"""Serveur local complet (pages + formulaire PHP), sans cache navigateur.

Lance le serveur intégré de PHP avec tools/router.php et charge les
modules nécessaires (SQLite, accents, chiffrement) sans php.ini.
Usage : python tools/serve-php.py [port]   (8000 par défaut)
Prérequis : PHP 8.x installé (winget install PHP.PHP.8.3).
"""
import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

php = shutil.which("php")
if not php:
    # winget n'ajoute PHP au PATH qu'aux nouvelles sessions : on le cherche là où il l'installe
    paquets = Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft/WinGet/Packages"
    trouves = sorted(paquets.glob("PHP.PHP.*/php.exe"))
    php = str(trouves[-1]) if trouves else None
if not php:
    sys.exit("PHP introuvable : installez-le avec  winget install PHP.PHP.8.3")

ext = Path(php).parent / "ext"
port = sys.argv[1] if len(sys.argv) > 1 else "8000"
cmd = [php, "-d", f"extension_dir={ext}"]
for module in ("pdo_sqlite", "mbstring", "openssl"):
    cmd += ["-d", f"extension={module}"]
cmd += ["-S", f"localhost:{port}", "-t", str(ROOT), str(ROOT / "tools/router.php")]

print(f"Site KYOLIS Manager (avec PHP) : http://localhost:{port}/")
sys.exit(subprocess.call(cmd, cwd=ROOT))
