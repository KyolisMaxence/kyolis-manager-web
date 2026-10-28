"""Floute les données sensibles des captures et les exporte pour le site.

Entrée : assets/img/captures/ (originaux, non publiés)
Sortie : assets/img/app/ (versions publiables, en .webp)
Usage  : python tools/masquer-captures.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets/img/captures"
OUT = ROOT / "assets/img/app"
OUT.mkdir(parents=True, exist_ok=True)

MAC_PC = (588, 276, 772, 305)          # adresse MAC du PC, écran Scan
MAC_PC_DETAIL = (843, 343, 1022, 372)  # adresse MAC du PC, écran Détail réseau
MAC_PC_SWITCH = (658, 212, 802, 236)   # adresse MAC du PC, fiche switch

# fichier source -> (fichier de sortie, zones à flouter, recadrage éventuel)
JOBS = {
    "01-scan.png":                ("scan", [MAC_PC], None),
    "02-mot-de-passe.png":        ("mot-de-passe", [(588, 226, 772, 255)], None),
    "03-detail-reseau.png":       ("detail-reseau", [MAC_PC_DETAIL], None),
    "04-actions-masse.png":       ("actions-masse", [MAC_PC_DETAIL], None),
    "05-ports.png":               ("ports", [], None),
    "06-maintenance-syslog.png":  ("maintenance", [], None),
    "07-syslog-direct.png":       ("syslog", [], None),
    "08-acces-ssh.png":           ("acces-ssh", [(358, 136, 1262, 162)], None),
    "09-partage.png":             ("partage", [(718, 612, 1197, 678), (1468, 28, 1920, 482)], None),
    "10-cartographie.webp":       ("cartographie", [], None),
    "11-carto-nommer.webp":       ("carto-nommer", [], None),
    "12-carto-ajout.webp":        ("carto-ajout", [], None),
    "13-carto-anomalie.webp":     ("carto-anomalie", [], None),
    "15-export-csv.webp":         ("export-csv", [(172, 417, 352, 437)], (0, 228, 1285, 1025)),
    "16-mes-reseaux.webp":        ("mes-reseaux", [], None),
    "17a-firmware-lancement.webp": ("firmware-lancement", [(1838, 349, 1967, 373), MAC_PC_SWITCH], None),
    "17b-firmware-en-cours.webp": ("firmware-en-cours", [(1838, 349, 1967, 373), MAC_PC_SWITCH], None),
    "17c-firmware-termine.webp":  ("firmware-termine", [(1838, 342, 1967, 366), MAC_PC_SWITCH], None),
    "18-windows-hello.webp":      ("windows-hello", [(210, 493, 312, 524), (690, 321, 772, 348)], None),
    "19-parametres-securite.png": ("parametres-securite", [(381, 243, 480, 272)], None),
    "20-journal-securite.png":    ("journal-securite", [(658, 480, 744, 1112)], None),
    # Fond déjà flouté par l'app ; recadrage autour de la fenêtre pour écarter
    # la barre de titre et le bandeau SBOM visible en bas.
    "22-verrouillage.png":        ("verrouillage", [], (475, 240, 1435, 880)),
    # 21-sbom.png volontairement exclu : le bandeau de vulnérabilités ne doit
    # pas être maquillé, la photo sera refaite après la mise à jour de l'app.
}

# Étiquette « Ordi perso » remplacée par un nom neutre sur la cartographie
RELABEL = {"13-carto-anomalie.webp": ((566, 661, 634, 677), "Poste atelier")}


# Recadrages lisibles affichés dans les pages (<nom>-cadre.webp).
# L'image entière (<nom>.webp) reste disponible pour l'agrandissement au clic.
CADRES = {
    "scan":                (270, 525, 1330, 1065),
    "actions-masse":       (270, 440, 1300, 1060),
    "ports":               (270, 150, 1890, 1045),
    "syslog":              (270, 330, 1300, 1010),
    "acces-ssh":           (270, 60, 1900, 620),
    "partage":             (680, 215, 1240, 975),
    "carto-anomalie":      (210, 160, 1450, 1000),
    "firmware-lancement":  (700, 280, 1700, 720),
    "windows-hello":       (150, 190, 1190, 830),
    "parametres-securite": (270, 440, 1230, 945),
    "journal-securite":    (270, 95, 1230, 720),
}
LARGEUR_MAX = 1400


def flouter(img, box):
    region = img.crop(box)
    w, h = region.size
    petit = region.resize((max(1, w // 10), max(1, h // 10)), Image.BILINEAR)
    region = petit.resize((w, h), Image.BILINEAR).filter(ImageFilter.GaussianBlur(4))
    img.paste(region, box[:2])


def renommer(img, box, texte):
    draw = ImageDraw.Draw(img)
    draw.rectangle(box, fill=(255, 255, 255))
    font = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 11)
    tw = draw.textlength(texte, font=font)
    cx = (box[0] + box[2]) / 2
    draw.text((cx - tw / 2, box[1] + 1), texte, fill=(60, 60, 60), font=font)


for src, (name, boxes, crop) in JOBS.items():
    img = Image.open(SRC / src).convert("RGB")
    for box in boxes:
        flouter(img, box)
    if src in RELABEL:
        renommer(img, *RELABEL[src])
    if crop:
        img = img.crop(crop)
    img.save(OUT / f"{name}.webp", "WEBP", quality=88, method=6)
    print(f"{src:30} -> app/{name}.webp {img.size}")
    if name in CADRES:
        cadre = img.crop(CADRES[name])
        if cadre.width > LARGEUR_MAX:
            cadre = cadre.resize((LARGEUR_MAX, round(cadre.height * LARGEUR_MAX / cadre.width)), Image.LANCZOS)
        cadre.save(OUT / f"{name}-cadre.webp", "WEBP", quality=90, method=6)
        print(f"{'':30} -> app/{name}-cadre.webp {cadre.size}")
