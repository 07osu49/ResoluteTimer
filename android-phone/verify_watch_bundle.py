"""Verify that the actual built watch APK is embedded unchanged in the phone APK."""
from pathlib import Path
import sys
import zipfile

phone,watch=map(Path,sys.argv[1:])
with zipfile.ZipFile(phone) as archive:
    assert archive.read('assets/watch/ResoluteTimer-Watch-1.0.apk')==watch.read_bytes()
    html=archive.read('assets/web/index.html').decode()
    assert 'Version 3.42 · Android' in html
    assert html.count("location.href='resolute-watch://save'")==1
    assert html.count("location.href='resolute-watch://help'")==1
    assert 'No timer sync.' in html
    assert 'schedule-import.js?v=342' in html
    assert 'Import schedule' in archive.read('assets/web/schedule-import.js').decode()
    for name in ['xlsx.full.min.js','tesseract.min.js','worker.min.js','tesseract-core-lstm.wasm.js','eng.traineddata']:
        assert archive.getinfo('assets/web/vendor/'+name).file_size>1000
print('PASS: watch APK embedded byte-for-byte; phone version and export controls verified')
