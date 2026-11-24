import { apiAutenticada } from './auth'

export type StatusPagamento = 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'REEMBOLSAR'

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

/**
 * Pede ao back-end que confira agora, no Mercado Pago, se o pedido já foi pago (usada ao voltar do Checkout Pro).
 * Quem confirma é o back-end: os parâmetros da URL de retorno são controlados pelo cliente e não valem como prova.
 * Devolve a situação do pagamento depois da consulta.
 */
export const sincronizarPagamento = (idPedido: number | string) =>
  apiAutenticada<Pagamento>(`/pagamento/pagamentos/${idPedido}/sincronizar`, { method: 'POST' })
