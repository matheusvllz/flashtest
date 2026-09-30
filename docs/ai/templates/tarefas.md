---
estado: em-execucao        # espelha o estado da spec
atualizado: AAAA-MM-DD
iniciativa: NN
---

# NN — <tema>: tarefas

> Use este arquivo só quando a lista de tarefas não couber bem dentro do `spec.md`. Cada tarefa tem um ID estável `T-FF.n` (FF = fase), que nunca é reaproveitado. Estados: `pendente` · `em-andamento` · `bloqueada` · `concluida` · `cancelada` · `adiada` (vira item de backlog). Regras de transição: [../SDD-WORKFLOW.md](../SDD-WORKFLOW.md) §3.

## Fase FF — <nome>

### T-FF.1 — <título> (P | M | G)

- **Estado:** pendente
- **Resultado:** <o que existe quando terminar, de forma verificável>
- **Depende:** <IDs ou "—">
- **Arquivos:** <caminhos; marcar **NOVO** quando o arquivo nascer aqui>
- **Skills:** <da matriz em ../SKILL-ROUTING.md; "—" quando basta a checklist da classe>
- **Aceite:** <critérios verificáveis>
- **Verificação:** `<comando exato>`
- **Risco/reversão:** <ou "—">
- **Externo:** <credencial ou ação do proprietário, ou "—">
- **Evidência:** <preenchido ao concluir: comando + saída resumida, ou link para a seção do registro>

**Gate da fase:** `bunx tsc --noEmit` · `bun test tests/unit` · `bunx playwright test` (se tocou UI) · `bun run build` · `bun run lint` · `bun run docs:check`.
