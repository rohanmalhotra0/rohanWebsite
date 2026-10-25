"""Cut Hubot Sans down to the two styles the site uses.

The variable Latin file is 93 KB. The site only sets it at two points:
display (width 125%, weight 800) and headings (width 112%, weight 700),
so two static instances (~21 KB each) replace it.

Run from Ashif/ after `npm ci` (needs `pip install fonttools brotli`):
    python3 scripts/subset-hubot.py
"""
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SOURCE = Path('node_modules/@fontsource-variable/hubot-sans/files/hubot-sans-latin-wdth-normal.woff2')
OUT = Path('src/assets/fonts')
STYLES = {
    'hubot-display-latin.woff2': {'wdth': 125, 'wght': 800},
    'hubot-heading-latin.woff2': {'wdth': 112, 'wght': 700},
}

OUT.mkdir(parents=True, exist_ok=True)
for name, location in STYLES.items():
    font = instancer.instantiateVariableFont(TTFont(SOURCE), location, updateFontNames=False)
    font.flavor = 'woff2'
    font.save(OUT / name)
    print(f'{name}: {(OUT / name).stat().st_size / 1024:.1f} KB')
