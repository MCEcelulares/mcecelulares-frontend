import { useCallback, useEffect, useRef, useState } from 'react'
import { mensagemDe, statusDe } from '../lib/api'
import { sincronizarPagamento, type Pagamento, type StatusPagamento } from '../lib/pagamentos'

export type ResultadoConfirmacao =
  | { situacao: 'confirmando' }
  | { situacao: 'aprovado' | 'pendente' | 'recusado' | 'reembolsar'; pagamento: Pagamento }
  | { situacao: 'sem_pagamento' }
  | { situacao: 'erro'; mensagem: string; status: number }

const SITUACOES = new Map<StatusPagamento, 'aprovado' | 'pendente' | 'recusado' | 'reembolsar'>([
  ['APROVADO', 'aprovado'],
  ['PENDENTE', 'pendente'],
  ['RECUSADO', 'recusado'],
  ['REEMBOLSAR', 'reembolsar'],
])

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
            mensagem: mensagemDe(e, 'Não foi possível confirmar o pagamento. Tente novamente.'),
            status: statusDe(e),
          },
  )
}

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
