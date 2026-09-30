/**
 * E-mails transacionais (docs/specs/46-producao T-05.3). Voz do Foca (docs/COPY.md): direta,
 * calma, sem emoji, sem culpa; tom sério em segurança e exclusão. Números e datas vêm por
 * parâmetro, nunca digitados no texto. Inventário: docs/copy/inventario.md (seção "E-mails").
 */
import type { Mensagem } from "./index";

const MAR = "#2E6BFF"; // --mar (docs/design/sistema-rabisco.md)
const ABISMO = "#3A3A3C"; // --abismo

function escapar(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function horas(n: number): string {
  return n === 1 ? "1 hora" : `${n} horas`;
}

function html(paragrafos: string[], botao: { rotulo: string; url: string }, rodape: string): string {
  const p = (t: string) => `<p style="margin:0 0 16px;font:16px/1.5 system-ui,sans-serif;color:${ABISMO}">${t}</p>`;
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;padding:24px;background:#F7F5F0">
<div style="max-width:480px;margin:0 auto;background:#fff;border-radius:20px;padding:28px">
<p style="margin:0 0 20px;font:700 20px system-ui,sans-serif;color:${ABISMO}">Foca</p>
${paragrafos.map(p).join("\n")}
<p style="margin:24px 0"><a href="${escapar(botao.url)}" style="display:inline-block;background:${MAR};color:#fff;text-decoration:none;font:700 16px system-ui,sans-serif;padding:14px 22px;border-radius:16px">${botao.rotulo}</a></p>
<p style="margin:0 0 8px;font:13px/1.5 system-ui,sans-serif;color:#6b6b70">Se o botão não abrir, copie este endereço no navegador:<br><span style="word-break:break-all">${escapar(botao.url)}</span></p>
<p style="margin:16px 0 0;font:13px/1.5 system-ui,sans-serif;color:#6b6b70">${rodape}</p>
</div></body></html>`;
}

export function emailVerificacao(p: { para: string; nome: string; url: string; validadeHoras: number }): Mensagem {
  const intro = p.nome.trim() ? `Oi, ${p.nome.trim()}.` : "Oi.";
  const corpo = "Para ativar sua conta no Foca, confirme este endereço de e-mail.";
  const validade = `O link vale por ${horas(p.validadeHoras)}.`;
  const rodape = "Se você não criou uma conta no Foca, ignore esta mensagem. Nenhuma conta será ativada.";
  return {
    para: p.para,
    assunto: "Confirme seu e-mail no Foca",
    texto: `${intro}\n\n${corpo}\n\nConfirmar e-mail: ${p.url}\n\n${validade}\n\n${rodape}`,
    html: html([escapar(intro), corpo, validade], { rotulo: "Confirmar e-mail", url: p.url }, rodape),
  };
}

export function emailRedefinicaoSenha(p: { para: string; url: string; validadeHoras: number }): Mensagem {
  const corpo = "Alguém pediu para redefinir a senha da sua conta no Foca.";
  const validade = `O link vale por ${horas(p.validadeHoras)}. Depois de criar a nova senha, você sai de todos os aparelhos e entra de novo.`;
  const rodape = "Se não foi você, ignore esta mensagem. Sua senha continua a mesma.";
  return {
    para: p.para,
    assunto: "Redefina sua senha do Foca",
    texto: `${corpo}\n\nCriar nova senha: ${p.url}\n\n${validade}\n\n${rodape}`,
    html: html([corpo, validade], { rotulo: "Criar nova senha", url: p.url }, rodape),
  };
}

export function emailContaExcluida(p: { para: string; diasBackup: number; urlPrivacidade: string }): Mensagem {
  const corpo = "Sua conta no Foca e os dados de estudo ligados a ela foram apagados.";
  const backup = `As cópias de segurança do banco de dados são apagadas automaticamente em até ${p.diasBackup === 1 ? "1 dia" : `${p.diasBackup} dias`}.`;
  const rodape = "Se não foi você quem pediu a exclusão, fale com a gente pelo contato indicado na política de privacidade.";
  return {
    para: p.para,
    assunto: "Sua conta no Foca foi excluída",
    texto: `${corpo}\n\n${backup}\n\n${rodape}\nPolítica de privacidade: ${p.urlPrivacidade}`,
    html: html([corpo, backup], { rotulo: "Ver a política de privacidade", url: p.urlPrivacidade }, rodape),
  };
}

export function emailConsentimentoResponsavel(p: {
  para: string;
  nomeAluno: string;
  url: string;
  validadeHoras: number;
  urlPrivacidade: string;
}): Mensagem {
  const aluno = escapar(p.nomeAluno.trim() || "Um aluno");
  const alunoTexto = p.nomeAluno.trim() || "Um aluno";
  const corpo1 = `${alunoTexto} usa o Foca para estudar para o ENEM e pediu para usar a Foca IA, a tutora com inteligência artificial do app.`;
  const corpo2 = "Por ser menor de 18 anos, precisa da autorização de um responsável. A Foca IA recebe as perguntas que o aluno escreve e as fotos de questões que ele envia. Esse conteúdo é processado pela OpenAI, nos Estados Unidos, e não fica guardado no Foca.";
  const corpo3 = `O link vale por ${horas(p.validadeHoras)}. A autorização pode ser revogada a qualquer momento pela conta do aluno.`;
  const rodape = `Se você não é responsável por ${alunoTexto}, ignore esta mensagem. Política de privacidade: ${p.urlPrivacidade}`;
  return {
    para: p.para,
    assunto: `${alunoTexto} pediu sua autorização para usar a Foca IA`,
    texto: `${corpo1}\n\n${corpo2}\n\nAutorizar a Foca IA: ${p.url}\n\n${corpo3}\n\n${rodape}`,
    html: html(
      [`${aluno} usa o Foca para estudar para o ENEM e pediu para usar a Foca IA, a tutora com inteligência artificial do app.`, corpo2, corpo3],
      { rotulo: "Autorizar a Foca IA", url: p.url },
      escapar(rodape),
    ),
  };
}
