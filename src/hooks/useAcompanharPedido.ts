import { useEffect, useState } from 'react'
import { buscarPedido, type StatusPedido } from '../lib/pedidos'

export const INTERVALO_ACOMPANHAMENTO_MS = 5000
const MAXIMO_DE_CONSULTAS = 24

interface Leitura {
  id: string
  status: StatusPedido | null
  esgotado: boolean
}

export function useAcompanharPedido(idPedido: string, ativo: boolean) {
  const [leitura, setLeitura] = useState<Leitura | null>(null)
  const [estavaAtivo, setEstavaAtivo] = useState(ativo)

  if (estavaAtivo !== ativo) {
    setEstavaAtivo(ativo)
    if (ativo) setLeitura(null)
  }

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
