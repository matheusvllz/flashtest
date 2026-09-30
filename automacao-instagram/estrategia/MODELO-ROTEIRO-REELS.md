# Modelo — roteiro de Reels gravado

Use para toda ideia de Reels que o dono do projeto vai gravar. Curto, falável, gravável com o celular numa tarde.

```markdown
## <Gancho falado — a primeira frase, dita nos 2 primeiros segundos>

- Formato: Reels 9:16 · duração estimada: <N a M s>
- Pilar: <reconhecimento | util | produto | bastidor | personagem>
- Situação/público: <quem está vendo e em que momento>
- Objetivo: <o que a pessoa leva>
- Relação com o Foca: <como aparece, ou "nenhuma">
- CTA: <um, ou nenhum>

### Roteiro (fala natural — escrito para ser dito, não lido)
1. <frase 1>
2. <frase 2>
…

### Plano de gravação
| Cena | O que aparece | Enquadramento | Take |
|---|---|---|---|
| 1 | Rosto, falando o gancho | vertical, peito para cima, luz de janela | 2–3 takes |
| 2 | Tela do celular com o app | tela gravada pelo próprio celular (gravação de tela) | 1 take |
| … | | | |

### Textos na tela
| Momento | Texto | Estilo |
|---|---|---|
| 0–2 s | <gancho curto> | titulo (topo) |
| … | | legenda / mao |

### Edição proposta
- Cortes: <silêncios e erros saem com `cortar-silencios`; ritmo alvo>
- Legendas: <sim/não; .srt de onde>
- Transições: <corte seco é o padrão; nada de efeito que não sirva>
- Som: <voz + identidade sonora do Foca | música adicionada no app, na publicação manual>

### Materiais necessários
- <celular, tripé ou apoio, app aberto numa tela específica, etc.>
```

## Regras

- **Os 2 primeiros segundos decidem.** O gancho falado nomeia a situação ("Você abre o caderno, olha três matérias e fecha"), nunca uma introdução ("Oi, gente, hoje eu vou…").
- **Fala, não texto lido.** Frases curtas, com "você". Nada que ninguém diria em voz alta.
- **Tela do app só gravada do app real.** Gravação de tela do celular, ou captura de `assets-src/marketing/shots/`. Nunca simular a interface.
- **Área segura:** texto na tela entre 300 px do topo e 420 px do rodapé (a interface do Instagram cobre o resto).
- **Sem promessa** de aprovação, nota, tempo de estudo, retenção. O validador confere os textos na tela e a legenda.
- **Música:** música do acervo do Instagram se adiciona **no app**, na hora de publicar; pela API ela não entra. Exporte a versão sem música e diga isso na entrega.

## Depois de gravar

```bash
mkdir -p conteudos/<id>/brutos          # copie os vídeos aqui; nunca são sobrescritos
bun run editar-video analisar conteudos/<id>/brutos/take-1.mp4
# escreva conteudos/<id>/roteiro.json (ver AGENTE.md §6.2)
bun run editar-video montar conteudos/<id>/roteiro.json
```
