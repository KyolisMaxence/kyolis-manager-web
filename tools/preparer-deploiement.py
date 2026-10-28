"""Assemble les fichiers à mettre en ligne dans storage/deploiement/www/ (+ un .zip).

Prend les fichiers du projet suivis par git (y compris les nouveaux, pas les
ignorés), retire ce qui ne doit pas être public (notes internes, outils,
données locales, captures brutes) et ajoute la configuration de production
storage/deploiement/config.php en www/api/config.php.
Le contenu de www/ se dépose tel quel dans le dossier www de l'hébergement OVH.
Usage : python tools/preparer-deploiement.py
"""
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SORTIE = ROOT / "storage/deploiement"
WWW = SORTIE / "www"
CONFIG = SORTIE / "config.php"

EXCLUS_DOSSIERS = (".claude/", "tools/", "storage/", "assets/img/captures/")
EXCLUS_FICHIERS = {"CLAUDE.md", "README.md", ".gitignore", "api/INSTALLATION.md", "api/config.example.php"}

if not CONFIG.is_file():
    sys.exit("Configuration de production absente : storage/deploiement/config.php")
if "'equipe_mot_de_passe_hash' => ''" in CONFIG.read_text(encoding="utf-8"):
    sys.exit("Mot de passe équipe non défini : python tools/mot-de-passe-equipe.py storage/deploiement/config.php")

fichiers = subprocess.run(
    ["git", "ls-files", "--cached", "--others", "--exclude-standard"],
    cwd=ROOT, capture_output=True, text=True, check=True,
).stdout.splitlines()

if WWW.exists():
    shutil.rmtree(WWW)
retenus = []
for f in fichiers:
    if f in EXCLUS_FICHIERS or f.startswith(EXCLUS_DOSSIERS) or not (ROOT / f).is_file():
        continue
    cible = WWW / f
    cible.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROOT / f, cible)
    retenus.append(f)
shutil.copy2(CONFIG, WWW / "api/config.php")

archive = SORTIE / "kyolismanager-www.zip"
with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as z:
    for p in sorted(WWW.rglob("*")):
        if p.is_file():
            z.write(p, p.relative_to(WWW).as_posix())

print(f"{len(retenus) + 1} fichiers prêts dans {WWW.relative_to(ROOT)} (et {archive.name})")
