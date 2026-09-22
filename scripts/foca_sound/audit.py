"""Read-only inventory of original WAV candidates; Python standard library."""
from pathlib import Path
import array
import hashlib
import json
import math
import sys
import wave

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/audio-proposal-v2'

def read(path):
    with wave.open(str(path), 'rb') as w:
        meta = dict(sample_rate=w.getframerate(), channels=w.getnchannels(), bits=w.getsampwidth()*8, frames=w.getnframes())
        assert meta['bits'] == 16
        pcm = array.array('h', w.readframes(w.getnframes()))
        if sys.byteorder != 'little':
            pcm.byteswap()
    return [v/32768 for v in pcm], meta

def db(v):
    return 20*math.log10(max(v, 1e-12))

def stats(x, sr):
    return dict(duration_s=round(len(x)/sr, 4), peak_dbfs=round(db(max(map(abs,x))),2),
                rms_dbfs=round(db(math.sqrt(sum(v*v for v in x)/len(x))),2), dc=sum(x)/len(x))

def run():
    OUT.mkdir(exist_ok=True)
    rows = []
    data = {}
    for p in sorted((ROOT/'docs/audio-candidates').glob('*.wav')):
        x, meta = read(p)
        data[p.stem] = x
        rows.append(dict(file=str(p.relative_to(ROOT)),sha256=hashlib.sha256(p.read_bytes()).hexdigest(),**meta,**stats(x,meta['sample_rate'])))
    pairs = []
    for i,a in enumerate(data):
        for b in list(data)[i+1:]:
            # Shared prefix correlation detects reused attacks/phrases, not perceptual equivalence.
            n = min(len(data[a]),len(data[b]),8820)
            x,y = data[a][:n],data[b][:n]
            corr = sum(u*v for u,v in zip(x,y))/math.sqrt(sum(u*u for u in x)*sum(v*v for v in y))
            pairs.append(dict(a=a,b=b,prefix_cosine=round(corr,5),window_ms=round(n/44.1,1)))
    preserved = {}
    for folder in ['src','public','docs/audio-candidates']:
        for p in (ROOT/folder).rglob('*'):
            if p.is_file():
                preserved[str(p.relative_to(ROOT))] = hashlib.sha256(p.read_bytes()).hexdigest()
    (OUT/'baseline-hashes.json').write_text(json.dumps(preserved,indent=2),encoding='utf-8')
    report = dict(files=rows,exact_duplicates=[(a['file'],b['file']) for i,a in enumerate(rows) for b in rows[i+1:] if a['sha256']==b['sha256']],prefix_comparisons=sorted(pairs,key=lambda p:-p['prefix_cosine']))
    (OUT/'original-audit.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps(dict(files=rows,closest_prefixes=report['prefix_comparisons'][:8]),indent=2))

if __name__ == '__main__':
    run()
