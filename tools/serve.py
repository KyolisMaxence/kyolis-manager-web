"""Serveur local de développement, sans cache navigateur.

Comme `python -m http.server`, mais chaque réponse interdit la mise en
cache : une modification de CSS ou d'un composant JS est visible au
simple rechargement de la page.
Usage : python tools/serve.py [port]   (8000 par défaut)
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
handler = partial(NoCacheHandler, directory=str(ROOT))
print(f"Site KYOLIS Manager : http://localhost:{port}/")
ThreadingHTTPServer(("", port), handler).serve_forever()
