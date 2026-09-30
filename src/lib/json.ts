/** Valor JSON (serializável pelas funções de servidor do TanStack Start). */
export type Json = string | number | boolean | null | Json[] | { [chave: string]: Json };
export type JsonObjeto = { [chave: string]: Json };
