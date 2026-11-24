import { useState } from 'react'
import { mensagemDe } from '../lib/api'
import type { ItemPedido } from '../lib/pedidos'
import { useCarrinho } from './useCarrinho'

export interface ResumoRecompra {
  adicionados: number
  falhas: string[]
}

/** Coloca de novo no carrinho os itens de um pedido. Itens sem estoque ou removidos do catálogo são listados em `falhas`. */
export function useComprarNovamente() {
  const { adicionar } = useCarrinho()
  const [executando, setExecutando] = useState(false)
  const [resultado, setResultado] = useState<ResumoRecompra | null>(null)

  const executar = async (itens: ItemPedido[]) => {
    setResultado(null)
    setExecutando(true)
    let adicionados = 0
    const falhas: string[] = []

    for (const item of itens) {
      if (item.id_produto === null) {
        falhas.push(`${item.nome_produto}: produto não está mais disponível`)
        continue
      }
      try {
        await adicionar(item.id_produto, item.quantidade)
        adicionados++
      } catch (e) {
        falhas.push(`${item.nome_produto}: ${mensagemDe(e, 'não foi possível adicionar')}`)
      }
    }

    setResultado({ adicionados, falhas })
    setExecutando(false)
  }

  return { executar, executando, resultado }
}
