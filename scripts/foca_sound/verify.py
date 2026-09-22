"""Signal/structural QA; does not claim a human listening test."""
import hashlib
import itertools
import json
import math
import sys
from audit import read, ROOT, OUT
from generate import SCORES

def cosine(a,b):
    return sum(x*y for x,y in zip(a,b))/max(1e-20,math.sqrt(sum(x*x for x in a)*sum(y*y for y in b)))

def envelope(x,bins=96):
    return [math.sqrt(sum(v*v for v in x[i*len(x)//bins:(i+1)*len(x)//bins])/max(1,len(x)//bins)) for i in range(bins)]

def run():
    sounds={k:read(OUT/'wav'/f'{k}.wav')[0] for k in SCORES}
    pairs=[]
    for a,b in itertools.combinations(sounds,2):
        n=min(len(sounds[a]),len(sounds[b]),9600)
        pairs.append(dict(a=a,b=b,prefix_cosine=round(cosine(sounds[a][:n],sounds[b][:n]),5),
                          time_normalized_envelope_cosine=round(cosine(envelope(sounds[a]),envelope(sounds[b])),4)))
    checks=[]
    for k,x in sounds.items():
        # Cubic intersample reconstruction is an estimate, not certified dBTP.
        peak=max(map(abs,x))
        for i in range(1,len(x)-2):
            a,b,c,d=x[i-1:i+3]
            for t in (.25,.5,.75):
                p=b+.5*t*(c-a+t*(2*a-5*b+4*c-d+t*(3*(b-c)+d-a)))
                peak=max(peak,abs(p))
        tail=math.sqrt(sum(v*v for v in x[-480:])/480)
        assert peak<.71 and abs(sum(x)/len(x))<1e-5
        assert tail<.002 and x[0]==x[-1]==0
        checks.append(dict(event=k,estimated_intersample_peak_dbfs=round(20*math.log10(peak),2),last_10ms_rms_dbfs=round(20*math.log10(max(1e-12,tail)),2),endpoints_zero=True))
    # A structural fingerprint includes normalized timing, intervals, voices and polyphony.
    signatures=[]
    for k,s in SCORES.items():
        from dsp import frequency
        base=frequency(s['notes'][0][1])
        signature=[(round(t/s['duration'],3),round(12*math.log2(frequency(n)/base),2),v) for t,n,_,v,_ in s['notes']]
        assert signature not in signatures
        signatures.append(signature)
    hashes=json.loads((OUT/'baseline-hashes.json').read_text())
    unchanged=all((ROOT/p).exists() and hashlib.sha256((ROOT/p).read_bytes()).hexdigest()==h for p,h in hashes.items())
    integrated = '--integrated' in sys.argv
    if integrated:
        for k in SCORES:
            assert (ROOT/'public/sfx/v2'/f'{k}.wav').read_bytes() == (OUT/'wav'/f'{k}.wav').read_bytes()
    else:
        assert unchanged,'Project changed since proposal audit; after approved integration use --integrated'
    report=dict(existing_files_unchanged=unchanged,preserved_files=len(hashes),checks=checks,pairs=pairs,
        limits='Signal measurements and score review, not human listening, LUFS certification or mobile-speaker validation. Envelope similarity alone is not duplication.')
    report['production_matches_approved'] = integrated
    name = 'production-quality-review.json' if integrated else 'quality-review.json'
    (OUT/name).write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps(dict(checks=checks,highest_prefix_correlations=sorted(pairs,key=lambda v:-abs(v['prefix_cosine']))[:5],existing_files_unchanged=unchanged),indent=2))

if __name__=='__main__':
    run()
