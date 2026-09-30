---
name: foca-backend
description: Convenções do backend do Foca (Claude Code e Codex) — função de servidor, rota de servidor, regra de negócio, recompensa, sincronização, banco e migração (Drizzle, PGlite/Neon), autenticação e sessão (Better Auth), e-mail, limites e testes com duas contas. Use ao criar ou mudar qualquer coisa em src/server/, src/lib/api/, src/lib/sync/, src/lib/recompensas.ts, drizzle/ ou na guarda de rotas. Não substitui a spec: a tarefa vem de docs/specs/.
---

# Foca — backend

O padrão abaixo é o que existe no código (46 F04–F07). Antes de mudar, leia a tarefa na spec e, se tocar dados ou acesso, `docs/seguranca/modelo-de-ameacas.md`. Toda mudança de backend é revisão **L2**.

## 1. Onde cada coisa mora

| O quê | Onde | Regra |
|---|---|---|
| Código só de servidor | `src/server/**` | O `importProtection` do `vite.config.ts` bloqueia esse caminho no bundle do navegador |
| Funções de servidor (a "API") | `src/lib/api/*.ts` com `createServerFn` | Importar de `@/server/**` só **dentro** do `.handler()` ou em módulo usado só por ele |
| Lógica testável | `src/server/<area>/*.ts`, funções `(db, userId, entrada, agora)` | Sem TanStack dentro; o teste chama direto com o banco de teste |
| Regras puras (XP, sequência, estrelas) | `src/lib/recompensas.ts` | **Fonte única** para o app e o servidor. Nunca duplicar uma regra |
| Contratos (zod) | `src/lib/sync/contrato.ts`, `src/lib/sync/importacao.ts`, `src/lib/api/conta.ts` | O mesmo esquema valida no cliente e no servidor |
| Esquema do banco | `src/server/db/schema/{auth,estudo}.ts` | Toda tabela do aluno tem `user_id` com FK `on delete cascade` |
| Ambiente | `src/server/env.ts` (zod) | Segredo nunca com prefixo `VITE_`; produção exige `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` |
| Guarda de rotas | `beforeLoad` de `src/routes/__root.tsx` + `ROTAS_PUBLICAS` em `src/lib/sessao.ts` | Negar por padrão. Rota pública nova entra na lista de propósito, com motivo no registro |

A raiz (`__root.tsx`) **não importa** store, AppShell nem conteúdo, e arquivo de rota só exporta `Route` (regra de code splitting, `docs/arquitetura/contratos.md`).

## 2. Função de servidor — o molde

```ts
export const fazerAlgo = createServerFn({ method: "POST" })
  .validator((d: unknown) => esquema.parse(d))          // contrato zod, com limites de tamanho
  .handler(async ({ data }) => {
    try {
      checarOrigem();                                    // POST: CSRF por Sec-Fetch-Site/Origin
      const s = await exigirSessao();                    // o userId vem da SESSÃO, nunca do corpo
      const db = await banco();
      await limitar(db, `fazer-algo:${s.userId}`, 60, 30); // limite por aluno (rate_limit no banco)
      return { ok: true as const, ...(await regra(db, s.userId, data)) };
    } catch (e) {
      return respostaDeErro(e);                          // { ok: false, codigo } — sem detalhe interno
    }
  });
```

- `ErroApp(status, CODIGO)` para erro esperado; o código é genérico e não revela se algo de outro aluno existe.
- Toda consulta filtra por `userId` da sessão. Nada de "buscar por id" sem o dono na mesma cláusula.
- Várias escritas que precisam andar juntas: `db.transaction`, travando a linha do perfil (`for("update")`) quando há contador ou teto.
- Log: `log(nivel, evento, campos)` de `src/server/http.ts` (omite chaves sensíveis). Nunca logar e-mail, senha, token, conteúdo de conversa ou corpo de requisição.

## 3. Recompensas e sincronização

- **O cliente relata fatos; o servidor decide recompensas.** Correção recalculada com `checkAnswer` sobre o gabarito (`src/server/estudo/conteudo.ts`); XP pelas regras de `recompensas.ts`, no livro `xp_ledger` com teto por chave (`greatest`); sequência pelos dias de `study_day`. Nenhum campo de XP ou nota vem do cliente.
- Ação de estudo nova no app: grava no store como sempre **e** enfileira um evento em `src/lib/store.ts` (`enfileirar`), com id estável (`idDeEvento`). Evento novo = variante nova no `eventoEstudo` + caso no `aplicarEventos` + teste. Um store só; nada de segundo mecanismo de estado.
- Estado local pertence a uma conta (`account.userId`); estado de outra conta é apagado antes de aparecer. Sair apaga o aparelho.

## 4. Banco e migração

1. Mudar o esquema em `src/server/db/schema/`.
2. `bun run db:generate` → **ler o SQL gerado** em `drizzle/` (destrutivo? índice? default?).
3. `bun run db:migrate` local (ou deixar o PGlite migrar no boot) → teste.
4. Migração só aditiva enquanto houver aparelho em versão anterior; remoção de coluna é uma segunda migração, depois.

Local: `pglite:.data/pglite` (desenvolvimento), `pglite:memoria` (testes). Produção: Neon (`@neondatabase/serverless`). `bun run db:reset:local` zera o local.

## 5. Autenticação

Better Auth em `src/server/auth/index.ts` (e-mail verificado, Google opcional, sessão de 30 dias, rate limit em banco, hooks de idade e de aceite dos termos). Sessão no servidor: `sessaoAtual()`/`exigirSessao()`. No cliente: `sessao()` de `src/lib/sessao.ts` (cache de 1 min; sem rede, a última sessão confirmada). E-mails em `src/server/email/` (caixa de saída em `.data/emails/` no desenvolvimento).

## 6. Testes (obrigatórios)

- Unitário de servidor: `tests/unit/servidor/`, com `ambiente()` e `alunoVerificado(amb, email)` de `ajuda.ts` (PGlite real, sem mock de banco).
- **Sempre duas contas**: A faz, B não vê nem altera. Mais adulteração (valor forjado, id de outro, data impossível, lote acima do limite, repetição).
- E2E com conta real: `tests/e2e/helpers/conta.ts`. Teste de sincronização cria as próprias contas (a sessão compartilhada dos outros E2E pausa o motor, chave só de desenvolvimento).
- Gate: `bunx tsc --noEmit` · `bun test tests/unit` · `bun run lint:ci` · `bun run build` · E2E da área.

## 7. Checklist L2 (antes de dizer pronto)

- [ ] userId só da sessão; toda consulta com o dono
- [ ] Contrato zod com limites; lote e tamanho com teto
- [ ] Origem conferida em POST; limite por aluno
- [ ] Erro genérico, sem enumerar contas nem vazar existência
- [ ] Transação onde há mais de uma escrita dependente
- [ ] Nenhum segredo no cliente, no log ou no repositório
- [ ] Teste com duas contas + teste de adulteração
- [ ] Registro da tarefa atualizado com a evidência
