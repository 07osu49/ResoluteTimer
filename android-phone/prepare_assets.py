"""Bundle version 3.17 web files locally; adjust platform text only."""
from pathlib import Path
import shutil

root=Path(__file__).resolve().parent
source=root.parent/'web'/'dist'
target=root/'app'/'src'/'main'/'assets'/'web'
target.mkdir(parents=True,exist_ok=True)
html=(source/'index.html').read_text()
assert 'Version 3.17' in html and 'GAME CLOCK 1 / 4' in html
html=html.replace('Add to iPhone: Safari → Share → Add to Home Screen','Android app · Keep open during play for alerts.')
html=html.replace('Version 3.17 · iPhone','Version 3.17 · Android')
(target/'index.html').write_text(html)
for name in ['app.js','horn.wav','icon.png','manifest.webmanifest']:
    shutil.copyfile(source/name,target/name)
icons=root/'app'/'src'/'main'/'res'/'drawable'
icons.mkdir(parents=True,exist_ok=True)
shutil.copyfile(source/'icon.png',icons/'app_icon.png')
print('Bundled Android 3.17 assets')
