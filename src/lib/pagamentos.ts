import { apiAutenticada } from './auth'

export type StatusPagamento = 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'REEMBOLSAR'

export interface Pagamento {
  id_pagamento: number
  id_pedido: number
  status: StatusPagamento
  url_pagamento: string | null
}

export const iniciarPagamento = (idPedido: number, valor: number, metodoPagamento = 'ONLINE') =>
  apiAutenticada<Pagamento>('/pagamento/pagamentos', { method: 'POST', json: { idPedido, metodoPagamento, valor } })

export const sincronizarPagamento = (idPedido: number | string) =>
  apiAutenticada<Pagamento>(`/pagamento/pagamentos/${idPedido}/sincronizar`, { method: 'POST' })

export const urlDePagamentoSegura = (url: string) => {
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}
