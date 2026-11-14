import { useEffect, useRef, useState } from 'react'
import { ApiError } from '../lib/api'
import { buscarProduto, type Produto } from '../lib/catalogo'

/**
 * Carrega os produtos dos ids informados (o carrinho e o pedido só trazem `id_produto`).
 * Valor `null` no mapa = produto não existe mais ou foi inativado. Cada id é buscado uma única vez.
 */
export function useProdutosPorId(ids: number[]): ReadonlyMap<number, Produto | null> {
  const [mapa, setMapa] = useState<ReadonlyMap<number, Produto | null>>(new Map())
  const pedidos = useRef(new Set<number>()) // só é lido e escrito dentro do efeito, nunca na renderização
  const chave = [...ids].sort((a, b) => a - b).join(',')

  useEffect(() => {
    const faltando = (chave ? chave.split(',').map(Number) : []).filter((id) => !pedidos.current.has(id))

    for (const id of faltando) {
      pedidos.current.add(id)
      buscarProduto(String(id))
        .then((produto) => setMapa((atual) => new Map(atual).set(id, produto)))
        .catch((e: unknown) => {
          if (e instanceof ApiError && (e.status === 404 || e.status === 400)) setMapa((atual) => new Map(atual).set(id, null))
          else pedidos.current.delete(id) // falha de rede: deixa tentar de novo na próxima vez
        })
    }
  }, [chave])

  return mapa
}
