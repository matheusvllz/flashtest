# 🗄️ Arquivo — a fase Abroad (23–24/07/2026)

Esta pasta guarda, **íntegra e sem edição**, a fase em que o projeto deixou de ser o Flash Test. Nada aqui está ativo. Está preservado porque foi trabalho real, tem decisões bem argumentadas, e porque descartar o registro de um pivô é perder a única evidência de por que ele foi feito.

## O que aconteceu

Em **23/07/2026**, na véspera do Pitch Day do Pre College da Link, o grupo **trocou de dor**. Saiu o app de estudo para o ENEM (Flash Test, persona João, tese "constância > conteúdo"); entrou o **Abroad** — uma plataforma que dá um _college counselor_ (humano, potencializado por IA) para quem quer estudar no exterior, persona **Liz**.

O argumento do pivô, resumido: a Liz **pode pagar** (o João não podia), o concorrente dela é caro e exclusivo (consultorias de admissão de R$ 20–100 mil) em vez de gratuito e estatal (MEC Enem), e a dor tem causa-raiz nomeável — a escola dela não oferece o counselor que as escolas de elite oferecem. Modelo de negócio premium em vez de freemium.

Um protótipo separado foi construído no Lovable ("Seu Futuro Internacional"), com counselor cockpit, scoring de perfil e chat aluno↔counselor. **Esse protótipo não é este repo** — é outro projeto, em outra pasta.

## O que foi revertido, e quando

Em **20/09/2026** o pivô foi desfeito: a linha viva do projeto voltou a ser o Flash Test. O código do app **nunca chegou a ser convertido** para o Abroad, então a reversão foi só na camada de documentos.

## O que está aqui

| Arquivo | O que é |
|---|---|
| `00-README-abroad.md` | O índice da pasta de specs na fase Abroad — é o melhor relato do pivô, dia a dia |
| `01-especificacao-problema-abroad.md` | A dor da Liz, com a causa-raiz do counselor |
| `02-plano-solucao-abroad.md` | Proposta de valor e modelo de negócio premium |
| `04-especificacao-pitch-abroad.md` | O pitch do Abroad (LP de 3 min + Golden Path do counselor) |
| `08-produto-e-estrategia-abroad.md` | O produto Abroad: 13 módulos, IA que amplia o counselor, DRE da alavanca de 30 alunos/dia |
| `14-persona-liz.md` | A persona Liz. **A Seção 8 tem a tabela João × Liz** — foi a partir dela que a persona João pôde ser reconstruída |
| `15-guia-de-copy-abroad.md` | Guia de copy: Big Idea, vocabulário, 30+ headlines, copy por canal |
| `17-kit-de-voz-abroad.md` | O `15` em uma página — kit operacional de voz |
| `18-especificacao-app-abroad.md` | Blueprint do app: arquitetura de informação, motor de IA, modelo de dados, roadmap |
| `19-copy-lp-instagram-e-pesquisa-abroad.md` | Copy da LP do Instagram + perguntas da pesquisa |
| `20-plano-mvp-pitch-abroad.md` | Estado real do protótipo Abroad, fases F1–F4, riscos, congelamento |
| `21-especificacao-prototipo-abroad.md` | Spec build-ready do protótipo, tela-a-tela |
| `Abroad Design System.html` | O design system do Abroad (Navy/Bordô/Gold/Cream, Cormorant Garamond) |
| `criar-forms-abroad.gs` | Google Apps Script que gerava o formulário da pesquisa |

## Se um dia quiser retomar

O `18` e o `21` são os dois documentos com valor reaproveitável mais alto — são especificações de produto completas e build-ready. O `15`/`17` valem por si como método de construção de voz de marca, mesmo para outro produto. E o `08` do Abroad tem um raciocínio de modelo de negócio (custo de serviço humano ÷ alavanca de IA) que o Flash Test nunca precisou fazer, porque não tem humano no circuito.
