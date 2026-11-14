import { apiAutenticada } from './auth'

type StatusPagamento = 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'REEMBOLSAR'

export interface Pagamento {
  id_pagamento: number
  id_pedido: number
  status: StatusPagamento
  /** Link do Checkout Pro do Mercado Pago; `null` no gateway simulado. */
  url_pagamento: string | null
}

/** Inicia o pagamento. O valor precisa ser exatamente o `valor_total` do pedido. */
export const iniciarPagamento = (idPedido: number, valor: number, metodoPagamento = 'ONLINE') =>
  apiAutenticada<Pagamento>('/pagamento/pagamentos', { method: 'POST', json: { idPedido, metodoPagamento, valor } })
