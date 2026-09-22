"""Small deterministic DSP toolkit. Standard library only, 48 kHz mono."""
import array
import math
import random
import sys
import wave

SR = 48000
TAU = math.tau

def frequency(note):
    names = {'C':0,'C#':1,'D':2,'D#':3,'E':4,'F':5,'F#':6,'G':7,'G#':8,'A':9,'A#':10,'B':11}
    midi = 12*(int(note[-1])+1)+names[note[:-1]]
    return 440*2**((midi-69)/12)

def fade(x, attack=.004, release=.025):
    x = list(x)
    a,r = min(len(x),int(attack*SR)),min(len(x),int(release*SR))
    for i in range(a):
        x[i] *= math.sin(math.pi*.5*i/max(1,a-1))**2
    for i in range(r):
        x[-1-i] *= math.sin(math.pi*.5*i/max(1,r-1))**2
    return x

def adsr(n, attack=.02, decay=.07, sustain=.55, release=.1):
    duration = n/SR
    out = []
    for i in range(n):
        t = i/SR
        if t < attack:
            v = .5-.5*math.cos(math.pi*t/attack)
        elif t < attack+decay:
            v = sustain+(1-sustain)*math.exp(-5*(t-attack)/decay)
        else:
            v = sustain
        v *= min(1,max(0,(duration-t)/release))**2
        out.append(v)
    return out

def oscillator(freq, duration, harmonics=((1,1),), drift=0):
    return [sum(amp*math.sin(TAU*freq*ratio*(i/SR)+drift*math.sin(TAU*3*i/SR)) for ratio,amp in harmonics if freq*ratio < SR*.4) for i in range(round(duration*SR))]

def lowpass(x, cutoff):
    alpha = 1-math.exp(-TAU*cutoff/SR)
    y=0
    result=[]
    for v in x:
        y += alpha*(v-y)
        result.append(y)
    return result

def highpass(x, cutoff=30):
    low=lowpass(x,cutoff)
    return [a-b for a,b in zip(x,low)]

def modal(freq, duration, modes, decay, attack):
    n=round(duration*SR)
    x=[0.0]*n
    for ratio,amp,damp in modes:
        if freq*ratio >= SR*.4:
            continue
        for i in range(n):
            t=i/SR
            x[i] += amp*math.sin(TAU*freq*ratio*t)*math.exp(-t/(decay*damp))
    return fade(x,attack,min(.045,duration*.25))

def bell(freq,duration):
    return modal(freq,duration,[(1,1,1),(2,.26,.58),(3,.11,.35),(4.02,.035,.18)],duration/5,.0035)

def mallet(freq,duration):
    return modal(freq,duration,[(1,1,1),(2,.17,.5),(3.98,.12,.2),(6.1,.018,.1)],duration/4.8,.006)

def felt(freq,duration):
    return lowpass(modal(freq,duration,[(1,1,1),(2,.12,.4),(3,.025,.2)],duration/4,.012),1800)

def ceramic(freq,duration):
    return modal(freq,duration,[(1,1,1),(2.76,.1,.22),(4.8,.04,.1)],duration/5,.004)

def pluck(freq,duration,seed=0):
    # Karplus–Strong: filtered noise excitation in a damped fractional-delay loop.
    rng=random.Random(seed)
    period=SR/freq-.5
    length=int(period)
    fraction=period-length
    ring=[rng.uniform(-1,1) for _ in range(length+2)]
    x=[]
    for i in range(round(duration*SR)):
        p=i%len(ring)
        a=ring[(p-length)%len(ring)]
        b=ring[(p-length-1)%len(ring)]
        c=ring[(p-length+1)%len(ring)]
        v=.992*((1-fraction)*(a+c)*.5+fraction*(a+b)*.5)
        ring[p]=v
        x.append(v)
    peak=max(map(abs,x),default=1)
    body=lowpass([v/peak*math.exp(-i/SR/(duration*.6)) for i,v in enumerate(x)],4200)
    return fade(body,.007,.04)

def pad(freq,duration):
    wave_=oscillator(freq,duration,[(1,1),(2,.16),(3,.04)],drift=.025)
    env=adsr(len(wave_),attack=.035,release=.13)
    return [v*e for v,e in zip(wave_,env)]

def air(duration,seed=0,cutoff=2200):
    rng=random.Random(seed)
    x=highpass(lowpass([rng.uniform(-1,1) for _ in range(round(duration*SR))],cutoff),650)
    return fade(x,min(.045,duration*.35),min(.08,duration*.5))

def mix(duration,layers):
    x=[0.0]*round(duration*SR)
    for start,samples,gain in layers:
        offset=round(start*SR)
        if offset+len(samples)>len(x):
            raise ValueError('Layer would be truncated')
        for i,v in enumerate(samples):
            x[offset+i]+=v*gain
    return x

def delay(x,seconds,gain):
    n=round(seconds*SR)
    y=x[:]
    for i in range(n,len(x)):
        y[i]+=x[i-n]*gain
    return y

def room(x,amount=.05):
    y=x[:]
    for seconds,gain in [(.017,.5),(.031,.3),(.047,.2)]:
        n=round(seconds*SR)
        for i in range(n,len(x)):
            y[i]+=x[i-n]*amount*gain
    return y

def master(x,target_rms_db,peak_ceiling_db=-4):
    x=fade(highpass(lowpass(x,10500)),.002,.035)
    # Remove residual DC while preserving exactly silent boundaries.
    weights=fade([1.0]*len(x),.002,.035)
    offset=sum(x)/sum(weights)
    x=[v-offset*w for v,w in zip(x,weights)]
    rms=math.sqrt(sum(v*v for v in x)/len(x))
    gain=min(10**(target_rms_db/20)/max(rms,1e-12),10**(peak_ceiling_db/20)/max(map(abs,x)))
    return [v*gain for v in x]

def export(path,x):
    assert all(math.isfinite(v) and abs(v)<1 for v in x)
    pcm=array.array('h',(round(v*32767) for v in x))
    if sys.byteorder!='little':
        pcm.byteswap()
    with wave.open(str(path),'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
