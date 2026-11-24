/**
 * Dica de resultado que o Mercado Pago devolve na URL de retorno do Checkout Pro
 * (`?status=approved&payment_id=123&external_reference=77&...`).
 *
 * É só uma DICA para escolher o texto enquanto o back-end confirma: o cliente controla essa URL, e qualquer pessoa
 * pode digitar `status=approved` na barra de endereço. O pagamento só vale quando o back-end confirma
 * (`sincronizarPagamento`, ADR-011).
 */
export type DicaRetorno = 'aprovado' | 'pendente' | 'recusado' | 'desconhecida'

export interface RetornoMercadoPago {
  dica: DicaRetorno
  /** Id do pagamento no Mercado Pago, quando veio e é numérico. Serve só para exibir ou depurar. */
  idPagamento: string | null
}

// Map (e não objeto) para `status=constructor` ou `status=__proto__` não acharem propriedades herdadas.
const DICAS = new Map<string, DicaRetorno>([
  ['approved', 'aprovado'],
  ['authorized', 'pendente'],
  ['pending', 'pendente'],
  ['in_process', 'pendente'],
  ['in_mediation', 'pendente'],
  ['rejected', 'recusado'],
  ['cancelled', 'recusado'],
])

/**
 * Lê o retorno do Mercado Pago. Sem pagamento feito (o cliente voltou sem pagar) o Mercado Pago manda `status=null`,
 * que vira `desconhecida`, assim como qualquer valor que não conhecemos.
 */
export function lerRetornoMercadoPago(parametros: URLSearchParams): RetornoMercadoPago {
  const status = (parametros.get('status') ?? parametros.get('collection_status') ?? '').trim().toLowerCase()
  const id = parametros.get('payment_id') ?? parametros.get('collection_id')

  return {
    dica: DICAS.get(status) ?? 'desconhecida',
    idPagamento: id && /^\d+$/.test(id) ? id : null,
  }
}
