"""Choisit le mot de passe de l'espace équipe et l'enregistre dans une config.

Le mot de passe est tapé sans s'afficher, puis seule son empreinte (bcrypt,
via password_hash de PHP) est écrite dans le fichier de configuration.
Le mot de passe lui-même n'est écrit nulle part.
Usage : python tools/mot-de-passe-equipe.py chemin/vers/config.php
"""
import getpass
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

if len(sys.argv) != 2 or not Path(sys.argv[1]).is_file():
    sys.exit("Usage : python tools/mot-de-passe-equipe.py chemin/vers/config.php")
config = Path(sys.argv[1])

php = shutil.which("php")
if not php:
    paquets = Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft/WinGet/Packages"
    trouves = sorted(paquets.glob("PHP.PHP.*/php.exe"))
    php = str(trouves[-1]) if trouves else None
if not php:
    sys.exit("PHP introuvable : installez-le avec  winget install PHP.PHP.8.3")

mdp = getpass.getpass("Mot de passe de l'espace équipe (12 caractères minimum) : ")
if len(mdp) < 12:
    sys.exit("Trop court : 12 caractères minimum.")
if getpass.getpass("Confirmez le mot de passe : ") != mdp:
    sys.exit("Les deux saisies ne correspondent pas.")

# Le mot de passe passe par l'entrée standard, jamais par la ligne de commande
empreinte = subprocess.run(
    [php, "-r", "echo password_hash(stream_get_contents(STDIN), PASSWORD_DEFAULT);"],
    input=mdp, capture_output=True, text=True, check=True,
).stdout.strip()

texte = config.read_text(encoding="utf-8")
texte, n = re.subn(r"('equipe_mot_de_passe_hash'\s*=>\s*)'[^']*'", lambda m: f"{m.group(1)}'{empreinte}'", texte)
if n != 1:
    sys.exit("Ligne 'equipe_mot_de_passe_hash' introuvable dans la configuration.")
config.write_text(texte, encoding="utf-8")
print("Mot de passe enregistré (seule son empreinte est dans le fichier).")
