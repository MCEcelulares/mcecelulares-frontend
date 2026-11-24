import { useEffect, useState } from 'react'
import { buscarPedido, type StatusPedido } from '../lib/pedidos'

/** Intervalo entre as consultas e total de tentativas (24 x 5 s = 2 minutos). */
export const INTERVALO_ACOMPANHAMENTO_MS = 5000
const MAXIMO_DE_CONSULTAS = 24

interface Leitura {
  id: string
  /** Último status lido; `null` enquanto nenhuma consulta deu certo. */
  status: StatusPedido | null
  /** Acabaram as tentativas e o pedido continua aguardando pagamento. */
  esgotado: boolean
}

/**
 * Enquanto `ativo`, consulta o pedido a cada poucos segundos até ele sair de `AGUARDANDO_PAGAMENTO` (o webhook do
 * Mercado Pago atualiza o pedido no back-end) ou acabarem as tentativas. Lê só o pedido (`buscarPedido`), nunca
 * `sincronizar`: aquele consulta o Mercado Pago e divide o limite de tentativas de pagamento com o botão "Pagar".
 * Falha de rede numa consulta não interrompe o acompanhamento.
 */
export function useAcompanharPedido(idPedido: string, ativo: boolean) {
  const [leitura, setLeitura] = useState<Leitura | null>(null)

  useEffect(() => {
    if (!ativo) return
    let valido = true
    let temporizador: ReturnType<typeof setTimeout>
    let consultas = 0

    const consultar = async () => {
      consultas += 1
      let status: StatusPedido | null = null
      try {
        status = (await buscarPedido(idPedido)).status
      } catch {
        // sem resposta agora; tenta de novo na próxima volta
      }
      if (!valido) return
      const resolvido = status !== null && status !== 'AGUARDANDO_PAGAMENTO'
      const esgotado = !resolvido && consultas >= MAXIMO_DE_CONSULTAS
      setLeitura({ id: idPedido, status, esgotado })
      if (!resolvido && !esgotado) temporizador = setTimeout(consultar, INTERVALO_ACOMPANHAMENTO_MS)
    }

    temporizador = setTimeout(consultar, INTERVALO_ACOMPANHAMENTO_MS)
    return () => {
      valido = false
      clearTimeout(temporizador)
    }
  }, [idPedido, ativo])

  const atual = leitura?.id === idPedido ? leitura : null
  return { status: atual?.status ?? null, esgotado: atual?.esgotado ?? false }
}
