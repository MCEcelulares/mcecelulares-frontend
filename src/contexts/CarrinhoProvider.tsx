import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import * as vendas from '../lib/vendas'
import { CarrinhoContext, type CarrinhoContextValue } from './carrinhoContext'

type Estado = { idUsuario: number; carrinho: vendas.Carrinho | null; erro?: boolean }

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth()
  const idUsuario = usuario?.id_usuario ?? null
  const [estado, setEstado] = useState<Estado | null>(null)

  useEffect(() => {
    if (idUsuario === null) return
    let ativo = true
    vendas
      .buscarCarrinho()
      .then((carrinho) => ativo && setEstado({ idUsuario, carrinho }))
      .catch(() => ativo && setEstado({ idUsuario, carrinho: null, erro: true }))
    return () => {
      ativo = false
    }
  }, [idUsuario])

  // Estado derivado: o carrinho guardado só vale para o usuário atual (some sozinho ao sair).
  const atual = estado && estado.idUsuario === idUsuario ? estado : null
  const carrinho = atual?.carrinho ?? null
  const erro = atual?.erro === true
  const carregando = idUsuario !== null && atual === null

  const aplicar = useCallback(
    (novo: vendas.Carrinho) => {
      if (idUsuario !== null) setEstado({ idUsuario, carrinho: novo })
    },
    [idUsuario],
  )

  const adicionar = useCallback<CarrinhoContextValue['adicionar']>(
    async (idProduto, quantidade) => aplicar(await vendas.adicionarItem(idProduto, quantidade)),
    [aplicar],
  )

  const atualizar = useCallback<CarrinhoContextValue['atualizar']>(
    async (idItem, quantidade) => aplicar(await vendas.atualizarItem(idItem, quantidade)),
    [aplicar],
  )

  const remover = useCallback<CarrinhoContextValue['remover']>(
    async (idItem) => {
      await vendas.removerItem(idItem)
      aplicar(await vendas.buscarCarrinho())
    },
    [aplicar],
  )

  const recarregar = useCallback(async () => aplicar(await vendas.buscarCarrinho()), [aplicar])

  const valor = useMemo<CarrinhoContextValue>(
    () => ({
      carrinho,
      carregando,
      erro,
      quantidadeTotal: carrinho?.itens.reduce((soma, i) => soma + i.quantidade, 0) ?? 0,
      adicionar,
      atualizar,
      remover,
      recarregar,
    }),
    [carrinho, carregando, erro, adicionar, atualizar, remover, recarregar],
  )

  return <CarrinhoContext.Provider value={valor}>{children}</CarrinhoContext.Provider>
}
