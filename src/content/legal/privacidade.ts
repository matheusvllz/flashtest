import { LEGAL } from "@/lib/legal";
import type { DocumentoLegal } from "./tipos";

/**
 * Política de privacidade — RASCUNHO (docs/specs/46-producao T-11.2). Escrita a partir do que o sistema faz
 * (docs/seguranca/privacidade.md). Pendências jurídicas em docs/legal/README.md; enquanto houver pendência, a
 * página mostra o aviso de rascunho e o cadastro fica desligado em produção. Não promete o que o sistema não faz.
 */
export const POLITICA_DE_PRIVACIDADE: DocumentoLegal = {
  titulo: "Política de privacidade",
  versao: LEGAL.privacidade.versao,
  vigenteDesde: null,
  rascunho: !LEGAL.privacidade.final,
  resumo:
    "Esta política explica quais dados o Foca trata, para quê, com quem compartilha, por quanto tempo guarda e como você exerce seus direitos. O Foca é um app de estudo para o ENEM. Usamos os seus dados para fazer o app funcionar e decidir o que você estuda em seguida. Não vendemos dados, não mostramos publicidade e não usamos seus dados para anúncios.",
  secoes: [
    {
      titulo: "1. Quem é o responsável pelos seus dados",
      paragrafos: [
        "O controlador dos dados é Matheus Vellozo Freire, responsável pelo Foca.",
        "Contato de privacidade e encarregado: pendente de definição. Este item será preenchido antes da versão final desta política.",
      ],
    },
    {
      titulo: "2. Quem pode usar o Foca",
      paragrafos: [
        "Para criar uma conta é preciso ter 17 anos ou mais. Pedimos o ano de nascimento no cadastro só para conferir isso. Se o ano indicar idade menor, a conta não é criada e os dados informados não são guardados.",
        "Para usar a Foca IA com menos de 18 anos, é preciso a autorização de um responsável, pedida por e-mail.",
      ],
    },
    {
      titulo: "3. Quais dados tratamos e para quê",
      itens: [
        "Dados da conta: e-mail, senha (guardada só como código irreversível) ou o vínculo com a sua conta do Google. Servem para você entrar.",
        "Perfil de estudo: primeiro nome, estado (UF), etapa escolar, curso e instituição que você quer, provas e preferências de estudo. Servem para montar o seu plano de estudo.",
        "Ano de nascimento: serve para conferir a idade mínima.",
        "Desempenho: suas respostas, as lições e atividades concluídas e a estimativa do que você já sabe. Servem para escolher a próxima questão, mostrar o seu progresso e calcular pontos e sequência de dias.",
        "Aceites e autorizações: a versão dos termos e desta política que você aceitou, com a data, e a autorização do responsável para a Foca IA, quando houver.",
        "Uso da Foca IA: quantas mensagens e fotos você enviou por dia, para controlar o limite do seu plano e o custo. O conteúdo das conversas não fica guardado nos nossos servidores.",
        "Segurança: registros de acesso (como tentativas de login) com o endereço IP encurtado, para prevenir abuso.",
      ],
      paragrafos: [
        "Não coletamos data completa de nascimento, escola, cidade, telefone, localização nem foto de perfil.",
      ],
    },
    {
      titulo: "4. Bases legais",
      paragrafos: [
        "Tratamos os dados principalmente para executar o contrato com você (prestar o serviço de estudo), sempre observando o seu melhor interesse, como exige a lei para adolescentes. Registros de segurança são tratados por legítimo interesse, para proteger a sua conta e o serviço. A autorização do responsável para a Foca IA é tratada como consentimento e pode ser revogada.",
        "As bases legais de cada tratamento estão em revisão jurídica.",
      ],
    },
    {
      titulo: "5. A Foca IA",
      paragrafos: [
        "A Foca IA é uma inteligência artificial que tira dúvidas sobre as questões. Ela pode errar: confira o que ela diz com o material da questão.",
        "Quando você usa a Foca IA, a sua mensagem, a questão que você está vendo, eventuais fotos que você enviar e informações do seu estudo (curso que você quer e resumo do seu desempenho) são enviadas à OpenAI, empresa dos Estados Unidos que fornece o modelo. A OpenAI não usa esse conteúdo para treinar os modelos dela e o guarda por até 30 dias para monitorar abuso, conforme a política dela. Não envie dados pessoais nas mensagens.",
        "Você pode desligar a Foca IA no seu perfil.",
      ],
    },
    {
      titulo: "6. Com quem compartilhamos",
      paragrafos: ["Compartilhamos dados só com os fornecedores que fazem o serviço funcionar:"],
      itens: [
        "Vercel (hospedagem do app; empresa dos Estados Unidos, com processamento em São Paulo).",
        "Neon (banco de dados, em São Paulo).",
        "Resend (envio de e-mails de verificação e de senha).",
        "Google (quando você entra com a conta do Google).",
        "OpenAI (Foca IA, nos Estados Unidos).",
        "YouTube (vídeos incorporados em algumas lições, conforme a política do Google).",
      ],
    },
    {
      titulo: "7. Transferência internacional",
      paragrafos: [
        "Alguns fornecedores ficam fora do Brasil (principalmente nos Estados Unidos). As salvaguardas usadas para essas transferências estão em revisão jurídica e serão descritas aqui antes da versão final desta política.",
      ],
    },
    {
      titulo: "8. Por quanto tempo guardamos",
      itens: [
        "Conta, perfil, desempenho, aceites: enquanto a conta existir.",
        "Contas que nunca confirmaram o e-mail: apagadas em até 7 dias.",
        "Uso diário da Foca IA: 90 dias.",
        "Registros de segurança: 6 meses.",
        "Cópias de segurança do banco de dados: apagadas automaticamente em até 7 dias.",
      ],
    },
    {
      titulo: "9. Cookies e armazenamento no aparelho",
      paragrafos: [
        "Usamos um cookie essencial para manter você conectado, que dura até 30 dias e se renova quando você usa o app. O app também guarda no seu aparelho uma cópia do seu estudo e das suas preferências (som, tema), para funcionar sem internet. Não usamos cookies de publicidade nem de análise.",
      ],
    },
    {
      titulo: "10. Seus direitos",
      paragrafos: ["Você pode, a qualquer momento:"],
      itens: [
        "Ver e baixar os seus dados, pelo perfil (Baixar meus dados).",
        "Corrigir o seu perfil, pelo próprio app.",
        "Excluir a sua conta e os dados ligados a ela, pelo perfil.",
        "Revogar a autorização da Foca IA.",
        "Pedir informações sobre o tratamento dos seus dados pelo contato de privacidade (pendente, ver item 1).",
      ],
    },
    {
      titulo: "11. Segurança e incidentes",
      paragrafos: [
        "Protegemos os dados com medidas técnicas como conexão criptografada, senha guardada como código irreversível, acesso restrito ao banco de dados e limites de tentativas. Nenhum sistema é totalmente imune a falhas. Se acontecer um incidente de segurança que possa trazer risco ou dano relevante, avisaremos você e a Autoridade Nacional de Proteção de Dados, como manda a lei.",
      ],
    },
    {
      titulo: "12. Mudanças nesta política",
      paragrafos: [
        "Se esta política mudar de forma importante, você verá a versão nova no app e precisará aceitá-la para continuar estudando.",
      ],
    },
  ],
};
