"""Six review-only alternatives, reusing the Foca DSP without changing v2 WAVs."""
import hashlib
import html
import itertools
import json
import math
from audit import ROOT, read, stats
from dsp import SR, frequency, modal, mix, room, master, export
from generate import VOICES
from verify import cosine, envelope

OUT = ROOT/'docs/audio-proposal-v2/alternatives'

def tine(freq, duration):
    return modal(freq,duration,[(1,1,1),(2,.32,.5),(3,.07,.3),(5,.025,.12)],duration/4.5,.005)

OPTIONS = {
 'correta-a-encaixe': dict(group='Resposta correta',label='A · Encaixe',duration=.30,
   description='Duas chegadas: Ré5 abre e Fá♯5/Lá5 fecham juntos. Mallet com acorde luminoso, compacto e afirmativo.',
   notes=[(0,'D5',.16,'mallet',.62),(.085,'F#5',.215,'tine',.63),(.085,'A5',.215,'bell',.28)]),
 'correta-b-sorriso': dict(group='Resposta correta',label='B · Sorriso',duration=.34,
   description='Mi5–Fá♯5–Lá5, subindo por graus próximos. Corda pinçada com chegada de lâmina quente: leve e orgânico.',
   notes=[(0,'E5',.16,'pluck',.38),(.065,'F#5',.16,'pluck',.45),(.14,'A5',.20,'tine',.7),(.142,'D5',.19,'felt',.17)]),
 'correta-c-gotinha': dict(group='Resposta correta',label='C · Gotinha',duration=.32,
   description='Lá4–Ré5–Fá♯5: salto seguido de terça maior. Cerâmica arredondada abre espaço para uma gota brilhante.',
   notes=[(0,'A4',.13,'ceramic',.45),(.055,'D5',.14,'ceramic',.55),(.125,'F#5',.195,'bell',.72),(.13,'A5',.17,'felt',.14)]),
 'consecutivo-a-impulso': dict(group='Acerto consecutivo',label='A · Impulso',duration=.43,
   description='Duas batidas curtas em Ré5 e uma chegada em Lá5/Ré6. Madeira e lâmina: impulso rítmico seguido de recompensa aberta.',
   notes=[(0,'D5',.105,'mallet',.49),(.068,'D5',.105,'mallet',.4),(.19,'A5',.24,'tine',.59),(.19,'D6',.24,'bell',.22)]),
 'consecutivo-b-fluidez': dict(group='Acerto consecutivo',label='B · Fluidez',duration=.46,
   description='Ré5–Fá♯5–Lá5–Ré6, com os intervalos entre ataques diminuindo. Mallet e lâmina alternados; gesto contínuo de progresso.',
   notes=[(0,'D5',.20,'mallet',.5),(.115,'F#5',.19,'tine',.5),(.20,'A5',.18,'mallet',.57),(.26,'D6',.20,'tine',.6)]),
 'consecutivo-c-brilho': dict(group='Acerto consecutivo',label='C · Brilho',duration=.44,
   description='Ré5/Fá♯5/Lá5 em acorde levemente aberto, pausa e resposta Lá5/Ré6. Corda e bell: recompensa em duas massas, sem escada melódica.',
   notes=[(0,'D5',.22,'pluck',.22),(.012,'F#5',.21,'tine',.38),(.026,'A5',.20,'tine',.3),(.21,'A5',.23,'bell',.5),(.21,'D6',.23,'bell',.22)]),
}

def run():
    original=ROOT/'docs/audio-proposal-v2/wav'
    baseline={p:hashlib.sha256(p.read_bytes()).hexdigest() for p in original.glob('*.wav')}
    OUT.mkdir(exist_ok=True)
    voices={**VOICES,'tine':tine}
    result=[]
    sounds={}
    for key,s in OPTIONS.items():
        layers=[(t,voices[v](frequency(note),d),g) for t,note,d,v,g in s['notes']]
        x=master(room(mix(s['duration'],layers),.055),-19.5 if key.startswith('correta') else -19)
        export(OUT/f'{key}.wav',x)
        pcm,meta=read(OUT/f'{key}.wav')
        st=stats(pcm,SR)
        assert pcm[0]==pcm[-1]==0 and abs(st['dc'])<1e-5
        assert max(map(abs,pcm))<.64
        tail=math.sqrt(sum(v*v for v in pcm[-480:])/480)
        assert tail<.002
        result.append(dict(file=key+'.wav',**s,**meta,**st,
            frequencies={n:round(frequency(n),2) for _,n,_,_,_ in s['notes']},
            sha256=hashlib.sha256((OUT/f'{key}.wav').read_bytes()).hexdigest()))
        sounds[key]=x
    assert len({r['sha256'] for r in result})==6
    pairs=[]
    comparison={**{p.stem:read(p)[0] for p in baseline},**sounds}
    for a,b in itertools.combinations(comparison,2):
        if a not in sounds and b not in sounds:
            continue
        n=min(len(comparison[a]),len(comparison[b]),9600)
        pairs.append(dict(a=a,b=b,prefix_cosine=round(cosine(comparison[a][:n],comparison[b][:n]),4),
                          envelope_cosine=round(cosine(envelope(comparison[a]),envelope(comparison[b])),4)))
    for prefix in ['correta','consecutivo']:
        reel=[]
        for key,x in sounds.items():
            if key.startswith(prefix):
                reel.extend(x);reel.extend([0.0]*int(.65*SR))
        export(OUT/f'previa-{prefix}-abc.wav',reel)
    assert all(hashlib.sha256(p.read_bytes()).hexdigest()==h for p,h in baseline.items())
    (OUT/'manifest.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    (OUT/'quality.json').write_text(json.dumps(dict(original_wavs_unchanged=True,pairs=pairs,
        limits='Revisão de composição e sinal; não substitui escuta humana.'),ensure_ascii=False,indent=2),encoding='utf-8')
    blocks=[]
    for group,old in [('Resposta correta','resposta-correta'),('Acerto consecutivo','acerto-consecutivo')]:
        cards=f'<article><h3>Versão anterior · referência</h3><audio controls preload="none" src="../wav/{old}.wav"></audio></article>'
        for r in result:
            if r['group']==group:
                cards+=f'<article><h3>{r["label"]}</h3><audio controls preload="none" src="{r["file"]}"></audio><p>{html.escape(r["description"])}</p><small>{r["duration_s"]:.2f} s · {r["rms_dbfs"]} dBFS RMS</small></article>'
        blocks.append(f'<h2>{group}</h2><section>{cards}</section>')
    page='''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Foca · alternativas de acerto</title><style>body{font:16px system-ui;background:#f6f4ed;color:#303034;max-width:1100px;margin:36px auto;padding:0 20px}h1{font-size:32px}h2{margin-top:36px}section{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px}article{background:white;border-radius:18px;padding:20px;border-bottom:4px solid #dedbd3}h3,a{color:#2e6bff}audio{width:100%}p{line-height:1.6}small{color:#595959}</style><h1>Qual acerto tem a cara do Foca?</h1><p>Três novas opções por evento. Os outros dez efeitos foram preservados. Escolha uma letra para resposta correta e outra para acerto consecutivo.</p><p><a href="../index.html">Ouvir a família original</a> · <a href="manifest.json">Notas e medições</a></p>'''+''.join(blocks)+'''<p>WAV 48 kHz · síntese Python · candidatos, sem substituição no aplicativo.</p><script>document.addEventListener('play',e=>{if(e.target.tagName==='AUDIO')document.querySelectorAll('audio').forEach(a=>{if(a!==e.target){a.pause();a.currentTime=0}})},true)</script></html>'''
    (OUT/'index.html').write_text(page,encoding='utf-8')
    (OUT/'README.md').write_text('# Alternativas de acerto\n\nPedido: manter os outros dez efeitos e explorar estes dois. Os 12 WAVs v2 foram preservados por hash.\n\n[Ouvir e comparar](index.html). Síntese: `py scripts/foca_sound/alternatives.py`, reutilizando `dsp.py`.\n\n'+ '\n\n'.join(f'## {r["group"]} — {r["label"]}\n\n[{r["file"]}]({r["file"]}) · {r["duration_s"]} s. {r["description"]}' for r in result)+'\n\nSeis WAVs individuais, duas prévias A/B/C, página de escuta, manifest e quality.json. Sem clipping nas amostras, DC < 1e-5 e pontas em zero. Comparação de 87 pares envolvendo as novas opções; sem inferir percepção a partir de correlação. A escuta humana segue pendente.\n',encoding='utf-8')
    print(json.dumps([{k:r[k] for k in ['file','duration_s','peak_dbfs','rms_dbfs']} for r in result],indent=2))
    print('Original WAVs unchanged; compared pairs:',len(pairs))

if __name__=='__main__':
    run()
