"""Generate review-only Foca v2 assets. Never writes src/ or public/."""
from pathlib import Path
import hashlib
import html
import json
import math
from dsp import SR, frequency, bell, mallet, felt, ceramic, pluck, pad, air, mix, room, master, export
from audit import read, stats

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/audio-proposal-v2'
VOICES=dict(bell=bell,mallet=mallet,felt=felt,ceramic=ceramic,pluck=pluck,pad=pad)

# Explicit compositions: no global melody transformed into multiple files.
# Note tuple: onset seconds, note, duration, voice, relative amplitude.
SCORES={
 'resposta-correta': dict(duration=.36,rms=-19,emotion='Acerto, pequena recompensa e conclusão positiva.',form='Três ataques ascendentes; terça menor + quarta justa; final mais cheio.',notes=[(0,'F#5',.16,'mallet',.65),(.067,'A5',.16,'mallet',.75),(.142,'D6',.218,'bell',.82),(.145,'D5',.19,'felt',.18)],air=[]),
 'resposta-incorreta': dict(duration=.23,rms=-25,emotion='Não foi dessa vez; pode continuar.',form='Dois toques foscos descendentes, sem acorde ou brilho.',notes=[(0,'E4',.125,'felt',.65),(.088,'D4',.142,'felt',.48)],air=[]),
 'acerto-consecutivo': dict(duration=.40,rms=-19,emotion='Você encontrou o ritmo.',form='Pluck sincopado, nota repetida e díade final; não repete o acerto.',notes=[(0,'A4',.16,'pluck',.65),(.060,'A4',.14,'ceramic',.34),(.17,'D5',.23,'pluck',.75),(.17,'F#5',.23,'bell',.27)],air=[]),
 'conclusao-licao': dict(duration=.62,rms=-21,emotion='Uma etapa terminada, sensação de repouso.',form='Díade aberta inicial; acorde de Ré maior como chegada, sem corrida de notas.',notes=[(0,'A4',.25,'mallet',.44),(0,'E5',.25,'mallet',.24),(.18,'D4',.44,'pad',.36),(.18,'F#4',.44,'pad',.26),(.18,'A4',.40,'pluck',.44)],air=[]),
 'level-up': dict(duration=.78,rms=-19,emotion='Subir para um novo patamar.',form='Escada rítmica de quatro plucks, seguida de acorde alto curto.',notes=[(0,'D4',.20,'pluck',.52),(.10,'E4',.20,'pluck',.54),(.22,'A4',.23,'pluck',.62),(.36,'D5',.42,'bell',.63),(.36,'F#5',.37,'pad',.22)],air=[(.29,.12,.10)]),
 'conquista': dict(duration=.88,rms=-20,emotion='Reconhecimento raro, acolhedor.',form='Medalhão: um ataque de cerâmica abre uma tríade sustentada; sem arpejo.',notes=[(0,'D5',.26,'ceramic',.56),(.085,'D4',.70,'pad',.31),(.085,'F#4',.70,'pad',.23),(.085,'A4',.70,'pad',.2),(.24,'A5',.55,'bell',.23)],air=[(.08,.28,.08)]),
 'streak-diario': dict(duration=.28,rms=-22,emotion='Presença de hoje reconhecida.',form='Dois toques secos na mesma nota com pequeno corpo de quinta no segundo.',notes=[(0,'D5',.115,'ceramic',.6),(.105,'D5',.175,'ceramic',.46),(.107,'A4',.17,'felt',.15)],air=[]),
 'marco-streak': dict(duration=.70,rms=-20,emotion='Constância acumulada merece um marco.',form='Três passos de madeira em quinta aberta; acorde final separado.',notes=[(0,'D4',.13,'mallet',.5),(.085,'A4',.13,'mallet',.42),(.205,'D4',.14,'mallet',.55),(.34,'F#4',.36,'bell',.43),(.34,'A4',.36,'bell',.25),(.34,'D5',.36,'bell',.23)],air=[]),
 'capitulo-desbloqueado': dict(duration=.44,rms=-22,emotion='Um caminho se abre.',form='Encaixe seco, sopro de página e quinta que ganha corpo; sem melodia de recompensa.',notes=[(0,'A4',.09,'ceramic',.35),(.09,'D5',.35,'pad',.4),(.09,'A5',.35,'pad',.18)],air=[(.035,.16,.24)]),
 'meta-diaria': dict(duration=.49,rms=-21,emotion='Por hoje, tarefa cumprida.',form='Carimbo harmônico: acorde simultâneo e um toque tônico de confirmação.',notes=[(0,'D5',.29,'mallet',.5),(0,'F#5',.29,'mallet',.3),(0,'A5',.29,'mallet',.16),(.225,'D5',.265,'ceramic',.30)],air=[]),
 'abertura-importante': dict(duration=.17,rms=-27,emotion='Entrada leve, sem prometer recompensa.',form='Sopro curto com um ponto de cerâmica; sem sequência musical.',notes=[(.018,'A4',.135,'ceramic',.28)],air=[(0,.11,.30)]),
 'recompensa-especial': dict(duration=.98,rms=-19.5,emotion='Surpresa valiosa, sem fanfarra excessiva.',form='Florescimento: acorde macio abre, duas gotas espaçadas respondem e repousam.',notes=[(0,'D4',.46,'pad',.29),(0,'A4',.46,'pad',.19),(.16,'F#5',.34,'bell',.48),(.36,'E6',.27,'bell',.25),(.54,'D6',.44,'bell',.4),(.54,'F#4',.42,'pad',.16)],air=[(.015,.29,.12)]),
}

def run():
    (OUT/'wav').mkdir(parents=True,exist_ok=True)
    manifest=[]
    sounds={}
    for k,s in SCORES.items():
        layers=[(t,VOICES[v](frequency(note),dur),gain) for t,note,dur,v,gain in s['notes']]
        for i,(t,dur,gain) in enumerate(s['air']):
            layers.append((t,air(dur,seed=71+i+len(k)),gain))
        x=master(room(mix(s['duration'],layers),.04 if s['duration']<.5 else .09),s['rms'])
        p=OUT/'wav'/f'{k}.wav'
        export(p,x)
        sounds[k]=x
        pcm,meta=read(p)
        measurements=stats(pcm,SR)
        assert max(map(abs,pcm))<10**(-3.9/20)
        assert abs(measurements['dc'])<1e-5
        assert pcm[0]==pcm[-1]==0
        manifest.append(dict(event=k,file=f'wav/{k}.wav',**s,**meta,**measurements,frequencies={n:round(frequency(n),2) for _,n,_,_,_ in s['notes']},sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    # Review reel: known order, .65 seconds of silence between effects.
    for name,keys in [('01-respostas',list(SCORES)[:3]),('02-progresso',list(SCORES)[3:8]),('03-descobertas',list(SCORES)[8:])]:
        reel=[]
        for k in keys:
            reel.extend(sounds[k]);reel.extend([0.0]*int(.65*SR))
        export(OUT/f'{name}.wav',reel)
    cards=[]
    for m in manifest:
        k=m['event']
        cards.append(f'<article><h2>{html.escape(k)}</h2><p>{html.escape(m["emotion"])}</p><audio controls preload="none" src="{m["file"]}"></audio><p>{m["duration_s"]:.2f}s · {m["rms_dbfs"]} dBFS RMS</p><p>{html.escape(m["form"])}</p><details><summary>Comparar candidato anterior</summary><audio controls preload="none" src="../audio-candidates/{k}.wav"></audio><p>Volumes originais preservados; o lote antigo tem picos mais altos.</p></details></article>')
    page='''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Foca · proposta sonora v2</title><style>body{background:#f6f4ed;color:#303034;font:16px system-ui;max-width:1060px;margin:40px auto;padding:0 20px}h1{font-size:36px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:18px}article{background:white;padding:22px;border-radius:20px;border-bottom:4px solid #dedbd3}h2{font-size:18px;color:#2e6bff}audio{width:100%}p{line-height:1.5}summary{cursor:pointer}a{color:#2e6bff}</style><h1>Foca · cada gesto tem uma voz</h1><p>Proposta v2 · síntese Python · 48 kHz · aguardando aprovação. Nenhum som do aplicativo foi substituído.</p><p>Ouça primeiro acerto e erro. Depois percorra a família. Os controles pausam o áudio anterior automaticamente.</p><p><a href="README.md">Auditoria e ficha completa</a> · <a href="manifest.json">Medições e partituras</a></p><main>'''+''.join(cards)+'''</main><script>document.addEventListener('play',e=>{if(e.target.tagName==='AUDIO')document.querySelectorAll('audio').forEach(a=>{if(a!==e.target)a.pause()})},true)</script></html>'''
    (OUT/'index.html').write_text(page,encoding='utf-8')
    print(json.dumps([{k:m[k] for k in ['event','duration_s','peak_dbfs','rms_dbfs']} for m in manifest],ensure_ascii=False,indent=2))

if __name__=='__main__':
    run()
