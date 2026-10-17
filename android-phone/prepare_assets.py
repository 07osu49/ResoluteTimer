"""Bundle the 3.67 web timer and standalone watch APK in Android phone 3.67."""
from pathlib import Path
import shutil

root=Path(__file__).resolve().parent
source=root.parent/'web'/'dist'
target=root/'app'/'src'/'main'/'assets'/'web'
target.mkdir(parents=True,exist_ok=True)
html=(source/'index.html').read_text()
assert 'Version 3.67' in html and 'Game Clock 1 / 4' in html
html=html.replace('Add to iPhone: Safari → Share → Add to Home Screen','Android app · Keep open during play for alerts.')
html=html.replace('Version 3.67 · iPhone','Version 3.67 · Android')
watch_apk=root.parent/'watch'/'app'/'build'/'outputs'/'apk'/'debug'/'app-debug.apk'
if not watch_apk.is_file():
    raise RuntimeError('Build the watch APK first: gradle -p ../watch :app:assembleDebug')
watch_target=root/'app'/'src'/'main'/'assets'/'watch'
watch_target.mkdir(parents=True,exist_ok=True)
shutil.copyfile(watch_apk,watch_target/'ResoluteTimer-Watch-1.0.apk')
marker='<dialog id="edit-dialog"'
assert marker in html
html=html.replace(marker,'''<section style="max-width:520px;margin:12px auto;padding:16px;background:#000;color:#fff;border-radius:12px;font-family:Arial,sans-serif"><h3 style="margin:0 0 12px">GALAXY WATCH SETUP</h3><p style="font-size:14px">Watch 1.0 included · Wi-Fi installation from this phone. No timer sync.</p><button type="button" style="width:100%;min-height:48px;margin-bottom:8px;background:#c62828;color:white;border:0;border-radius:6px;font-size:16px;font-weight:bold" onclick="location.href='resolute-watch://save'">Save Watch APK</button><button type="button" style="width:100%;min-height:48px;background:#2d2d2d;color:white;border:0;border-radius:6px;font-size:16px" onclick="location.href='resolute-watch://help'">Watch Installation Instructions</button></section>'''+marker)
(target/'index.html').write_text(html)
for name in ['app.js','schedule-import.js','IMPORT-LICENSES.txt','horn.wav','end_of_period_buzzer.mp3','icon.png','e9-logo.jpg','resolute-logo-transparent.png','manifest.webmanifest']:
    shutil.copyfile(source/name,target/name)
shutil.copytree(source/'vendor',target/'vendor',dirs_exist_ok=True)
icons=root/'app'/'src'/'main'/'res'/'drawable'
icons.mkdir(parents=True,exist_ok=True)
shutil.copyfile(source/'icon.png',icons/'app_icon.png')
print('Bundled Android 3.67 with Watch 1.0 APK')
