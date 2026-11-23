import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, statusDe } from '../lib/api'
import { sincronizarPagamento, type Pagamento, type StatusPagamento } from '../lib/pagamentos'

/** O que sabemos do pagamento depois de perguntar ao back-end (nunca o que a URL de retorno diz). */
export type ResultadoConfirmacao =
  | { situacao: 'confirmando' }
  | { situacao: 'aprovado' | 'pendente' | 'recusado' | 'reembolsar'; pagamento: Pagamento }
  /** 404: o cliente chegou aqui sem ter iniciado um pagamento para este pedido. */
  | { situacao: 'sem_pagamento' }
  | { situacao: 'erro'; mensagem: string; status: number }

const SITUACOES = new Map<StatusPagamento, 'aprovado' | 'pendente' | 'recusado' | 'reembolsar'>([
  ['APROVADO', 'aprovado'],
  ['PENDENTE', 'pendente'],
  ['RECUSADO', 'recusado'],
  ['REEMBOLSAR', 'reembolsar'],
])

// Nunca rejeita: sucesso e falha viram o mesmo formato.
function consultar(idPedido: string): Promise<ResultadoConfirmacao> {
  if (!/^[1-9]\d*$/.test(idPedido)) {
    return Promise.resolve({ situacao: 'erro', mensagem: 'Pedido inválido.', status: 400 })
  }
  return sincronizarPagamento(idPedido).then(
    (pagamento): ResultadoConfirmacao => ({ situacao: SITUACOES.get(pagamento.status) ?? 'pendente', pagamento }),
    (e: unknown): ResultadoConfirmacao =>
      statusDe(e) === 404
        ? { situacao: 'sem_pagamento' }
        : {
            situacao: 'erro',
            mensagem: e instanceof ApiError ? e.message : 'Não foi possível confirmar o pagamento. Tente novamente.',
            status: statusDe(e),
          },
  )
}

/**
 * Pergunta ao back-end, uma única vez por pedido, se o pagamento já foi confirmado no Mercado Pago.
 * O modo estrito do React roda os efeitos duas vezes em desenvolvimento; como `sincronizar` consulta o Mercado Pago e conta
 * no limite de tentativas de pagamento, a primeira chamada fica guardada e a segunda execução apenas a reaproveita.
 * `verificarNovamente` faz uma nova consulta (botão manual, acompanhamento de pendência).
 */
export function useConfirmarPagamento(idPedido: string) {
  const [guardado, setGuardado] = useState<{ id: string; resultado: ResultadoConfirmacao } | null>(null)
  const pedida = useRef<{ id: string; promessa: Promise<ResultadoConfirmacao> } | null>(null)

  useEffect(() => {
    let valida = true
    if (pedida.current?.id !== idPedido) pedida.current = { id: idPedido, promessa: consultar(idPedido) }
    pedida.current.promessa.then((resultado) => valida && setGuardado({ id: idPedido, resultado }))
    return () => {
      valida = false
    }
  }, [idPedido])

  const verificarNovamente = useCallback(async () => {
    const promessa = consultar(idPedido)
    pedida.current = { id: idPedido, promessa }
    setGuardado(null)
    setGuardado({ id: idPedido, resultado: await promessa })
  }, [idPedido])

  const resultado: ResultadoConfirmacao = guardado?.id === idPedido ? guardado.resultado : { situacao: 'confirmando' }
  return { resultado, verificarNovamente }
}
