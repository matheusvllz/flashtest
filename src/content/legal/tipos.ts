/**
 * Formato dos documentos legais (docs/specs/46-producao §H.4; docs/legal/README.md). Texto como dado
 * estruturado: renderizado sem HTML cru (sem `dangerouslySetInnerHTML`) e versionado junto do código.
 */
export interface SecaoLegal {
  titulo: string;
  paragrafos?: string[];
  itens?: string[];
}

export interface DocumentoLegal {
  titulo: string;
  versao: string;
  /** Data a partir da qual vale (AAAA-MM-DD); `null` enquanto for rascunho. */
  vigenteDesde: string | null;
  /** Rascunho = ainda há pendência jurídica (docs/legal/README.md); a tela mostra o aviso. */
  rascunho: boolean;
  resumo: string;
  secoes: SecaoLegal[];
}
