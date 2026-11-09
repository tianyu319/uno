"""Refresh embedded project data so both HTML files can be opened directly."""
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
items = json.loads((root / 'dist/assets/projects.json').read_text())
embedded = json.dumps(items, ensure_ascii=False, indent=2).replace('</', '<\\/')
for name in ('works.html', 'works-local-preview.html'):
    page = root / 'dist' / name
    html = page.read_text()
    html = re.sub(r'<script id="project-catalogue" type="application/json">[\s\S]*?</script>\s*', '', html)
    html = html.replace('</body>', '<script id="project-catalogue" type="application/json">' + embedded + '</script>\n</body>')
    html = html.replace('assets/works.js?v=20261108-packaging', 'assets/works.js?v=20261108-local-entry')
    page.write_text(html)
print(f'Synced {len(items)} projects into both local HTML entry points.')
