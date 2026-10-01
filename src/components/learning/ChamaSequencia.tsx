/**
 * Chama da sequência com o número dentro (spec 48 D48-18, pedido do proprietário em 01/10). Acesa (laranja) quando
 * hoje já tem estudo; apagada (cinza) quando ainda não tem — o número continua lá, nada de "perdeu". Cores só pelos
 * tokens base (`--brasa`, `--chama-*`), que trocam no modo escuro.
 */
export function ChamaSequencia({ dias, acesa, tamanho = 50 }: { dias: number; acesa: boolean; tamanho?: number }) {
  const corpo = acesa ? "var(--brasa)" : "var(--chama-apagada)";
  const aresta = acesa ? "var(--chama-aresta)" : "var(--chama-apagada-aresta)";
  const miolo = acesa ? "var(--chama-miolo)" : "var(--chama-apagada-miolo)";
  const numero = acesa ? "var(--chama-numero)" : "var(--chama-apagada-numero)";
  const texto = dias > 999 ? "999+" : String(dias);
  const fonte = texto.length <= 2 ? 21 : texto.length === 3 ? 16 : 12;

  return (
    <svg
      width={tamanho}
      height={(tamanho * 56) / 48}
      viewBox="0 0 48 56"
      aria-hidden
      className="block shrink-0 overflow-visible"
      data-chama={acesa ? "acesa" : "apagada"}
    >
      <path
        d="M24 2c5.5 9.5 19 17.5 19 33.5C43 47 34.6 54.5 24 54.5S5 47 5 35.5c0-8.6 4.6-14.6 9.6-19.4.2 5.6 2.6 9 6 10.4C19.6 17.4 21 9.6 24 2Z"
        fill={corpo}
        stroke={aresta}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <path d="M24 19.5c5 6.2 14.5 10.8 14.5 21 0 8-6.4 12.6-14.5 12.6S9.5 48.5 9.5 40.5c0-10.2 9.5-14.8 14.5-21Z" fill={miolo} />
      <text
        x="24"
        y="41.5"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fonte}
        fontWeight={800}
        fill={numero}
        className="font-display tabular-nums"
      >
        {texto}
      </text>
    </svg>
  );
}
