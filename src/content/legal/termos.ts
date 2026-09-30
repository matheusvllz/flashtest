import { LEGAL } from "@/lib/legal";
import type { DocumentoLegal } from "./tipos";

/**
 * Termos de uso — RASCUNHO (docs/specs/46-producao T-11.2). Pendências jurídicas em docs/legal/README.md; enquanto
 * houver pendência, a página mostra o aviso de rascunho e o cadastro fica desligado em produção.
 * Nada aqui promete aprovação, nota, preço ou resultado (docs/copy/01-estrategia.md §6).
 */
export const TERMOS_DE_USO: DocumentoLegal = {
  titulo: "Termos de uso",
  versao: LEGAL.termos.versao,
  vigenteDesde: null,
  rascunho: !LEGAL.termos.final,
  resumo:
    "Estes termos são o acordo entre você e o Foca sobre o uso do app. Ao criar a conta, você declara que leu e aceita estes termos e a política de privacidade.",
  secoes: [
    {
      titulo: "1. O que é o Foca",
      paragrafos: [
        "O Foca é um app de estudo para o ENEM, com lições curtas, questões e uma trilha que escolhe o próximo passo a partir das suas respostas. O Foca é um apoio ao estudo: não garante aprovação, nota ou vaga em nenhuma instituição.",
        "O responsável pelo Foca é Matheus Vellozo Freire. Contato: pendente de definição.",
      ],
    },
    {
      titulo: "2. Quem pode usar",
      paragrafos: [
        "É preciso ter 17 anos ou mais para criar uma conta. Você declara que o ano de nascimento informado é verdadeiro. Para usar a Foca IA com menos de 18 anos, é preciso a autorização de um responsável.",
        "Classificação indicativa: pendente de definição.",
      ],
    },
    {
      titulo: "3. Sua conta",
      itens: [
        "Use um e-mail seu e uma senha só sua. Você é responsável pelo que acontece com a sua conta.",
        "Se desconfiar que alguém acessou a sua conta, troque a senha e use a opção de sair de todos os aparelhos.",
        "Você pode excluir a sua conta quando quiser, pelo perfil.",
      ],
    },
    {
      titulo: "4. A Foca IA",
      paragrafos: [
        "A Foca IA é uma inteligência artificial. Ela pode errar e não substitui professor, escola ou orientação profissional. Confira as respostas dela com o material da questão.",
        "O uso da Foca IA tem limite diário, que depende do seu plano. No plano grátis, são até 3 mensagens por dia.",
        "Não envie dados pessoais seus ou de outras pessoas nas mensagens nem nas fotos.",
        "Se você estiver passando por um momento difícil, procure ajuda: o CVV atende pelo telefone 188, de graça, a qualquer hora.",
      ],
    },
    {
      titulo: "5. Uso permitido",
      paragrafos: ["Ao usar o Foca, você concorda em não:"],
      itens: [
        "Tentar acessar a conta ou os dados de outra pessoa.",
        "Automatizar respostas, pontos ou atividades, ou interferir no funcionamento do app.",
        "Usar a Foca IA para gerar conteúdo ilegal, ofensivo ou que viole direitos de terceiros.",
        "Copiar ou redistribuir o conteúdo do app em escala, fora do seu estudo pessoal.",
      ],
    },
    {
      titulo: "6. Conteúdo",
      paragrafos: [
        "As questões oficiais do ENEM aparecem com a identificação do exame e do ano. As demais questões e lições foram produzidas para o Foca, com apoio de inteligência artificial e revisão, e podem conter erros. Se encontrar um erro, avise pelo contato do item 1.",
        "O app, a marca Foca, a mascote e o conteúdo produzido para o Foca pertencem ao responsável pelo Foca.",
      ],
    },
    {
      titulo: "7. Planos",
      paragrafos: [
        "Hoje o Foca é gratuito. Planos pagos, quando existirem, terão preço e condições informados antes da contratação, com o direito de arrependimento previsto no Código de Defesa do Consumidor.",
      ],
    },
    {
      titulo: "8. Disponibilidade",
      paragrafos: [
        "Trabalhamos para o Foca funcionar sempre, mas ele pode ficar fora do ar por manutenção ou falha. O app guarda o seu estudo no aparelho e sincroniza quando a conexão volta.",
      ],
    },
    {
      titulo: "9. Encerramento",
      paragrafos: [
        "Você pode excluir a sua conta a qualquer momento. Podemos suspender uma conta que viole estes termos, com aviso sempre que possível.",
      ],
    },
    {
      titulo: "10. Mudanças nestes termos",
      paragrafos: [
        "Se estes termos mudarem de forma importante, você verá a versão nova no app e precisará aceitá-la para continuar estudando.",
      ],
    },
    {
      titulo: "11. Lei aplicável e foro",
      paragrafos: ["Estes termos seguem a lei brasileira. O foro competente está pendente de definição na revisão jurídica."],
    },
  ],
};
