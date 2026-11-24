import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { AlertaErro } from '../components/auth/AuthShell'
import { classeBotao } from '../components/ui/botao'
import { Carregando } from '../components/ui/Carregando'
import { EstadoVazio } from '../components/ui/EstadoVazio'
import { useCarrinho } from '../hooks/useCarrinho'
import { useProdutosPorId } from '../hooks/useProdutosPorId'
import { mensagemDe } from '../lib/api'
import { Miniatura } from '../components/ui/Miniatura'
import type { Produto } from '../lib/catalogo'
import { formatarPreco } from '../lib/formatar'
import type { ItemCarrinho } from '../lib/vendas'

const MAX_POR_ITEM = 99

type Situacao = 'carregando' | 'indisponivel' | 'insuficiente' | 'ok'

function situacaoDoItem(item: ItemCarrinho, produto: Produto | null | undefined): Situacao {
  if (produto === undefined) return 'carregando'
  if (produto === null || !produto.ativo || produto.estoque <= 0) return 'indisponivel'
  return produto.estoque < item.quantidade ? 'insuficiente' : 'ok'
}

function Status({ situacao, estoque }: { situacao: Situacao; estoque?: number }) {
  if (situacao === 'indisponivel') return <p className="text-sm font-medium text-red-600">Produto indisponível. Remova do carrinho.</p>
  if (situacao === 'insuficiente') return <p className="text-sm font-medium text-amber-600">Restam apenas {estoque} em estoque. Ajuste a quantidade.</p>
  if (situacao === 'ok') return <p className="text-sm font-medium text-success">Em estoque</p>
  return <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
}

interface LinhaProps {
  item: ItemCarrinho
  produto: Produto | null | undefined
  ocupado: boolean
  onQuantidade: (item: ItemCarrinho, quantidade: number) => void
  onRemover: (item: ItemCarrinho) => void
}

function LinhaItem({ item, produto, ocupado, onQuantidade, onRemover }: LinhaProps) {
  const situacao = situacaoDoItem(item, produto)
  const max = Math.min(MAX_POR_ITEM, produto?.estoque ?? item.quantidade)
  const botao = 'flex h-9 w-9 items-center justify-center text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'

  return (
    <li className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap sm:p-5">
      <Miniatura imagem={produto?.imagem} tamanho="xl" />

      <div className="min-w-0 flex-1 basis-40">
        {produto ? (
          <Link to={`/produtos/${produto.id_produto}`} className="line-clamp-2 font-semibold hover:text-brand-600">{produto.nome}</Link>
        ) : (
          <span className="font-semibold text-slate-500">{produto === null ? 'Produto removido do catálogo' : 'Carregando produto...'}</span>
        )}
        <div className="mt-1"><Status situacao={situacao} estoque={produto?.estoque} /></div>
      </div>

      <div className="inline-flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white" role="group" aria-label="Quantidade">
        <button className={botao} disabled={ocupado || item.quantidade <= 1} onClick={() => onQuantidade(item, item.quantidade - 1)} aria-label="Diminuir quantidade">
          <Minus size={14} />
        </button>
        <span className="w-10 text-center text-sm font-semibold" aria-live="polite">{item.quantidade}</span>
        <button className={botao} disabled={ocupado || item.quantidade >= max} onClick={() => onQuantidade(item, item.quantidade + 1)} aria-label="Aumentar quantidade">
          <Plus size={14} />
        </button>
      </div>

      <div className="min-w-28 text-right">
        <p className="titulo-secao">{formatarPreco(item.subtotal)}</p>
        {item.quantidade > 1 && <p className="text-xs text-slate-500">{formatarPreco(item.preco_unitario)} cada</p>}
      </div>

      <button
        onClick={() => onRemover(item)}
        disabled={ocupado}
        aria-label={`Remover ${produto?.nome ?? 'item'} do carrinho`}
        className="rounded-full p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-40"
      >
        <Trash2 size={18} />
      </button>
    </li>
  )
}

export default function Carrinho() {
  const { carrinho, carregando, erro: erroCarrinho, recarregar, atualizar, remover, quantidadeTotal } = useCarrinho()
  const [pendentes, setPendentes] = useState<Set<number>>(new Set())
  const [erro, setErro] = useState<string | null>(null)
  const produtos = useProdutosPorId(carrinho?.itens.map((i) => i.id_produto) ?? [])

  const executar = async (idItem: number, acao: () => Promise<void>) => {
    setErro(null)
    setPendentes((p) => new Set(p).add(idItem))
    try {
      await acao()
    } catch (e) {
      setErro(mensagemDe(e, 'Não foi possível atualizar o carrinho. Tente novamente.'))
    } finally {
      setPendentes((p) => {
        const novo = new Set(p)
        novo.delete(idItem)
        return novo
      })
    }
  }

  const itens = carrinho?.itens ?? []
  const bloqueado = itens.some((i) => {
    const s = situacaoDoItem(i, produtos.get(i.id_produto))
    return s === 'indisponivel' || s === 'insuficiente'
  })

  return (
    <div className="pagina py-10">
      <h1 className="titulo-pagina">Meu Carrinho</h1>

      {carregando ? (
        <Carregando rotulo="Carregando carrinho" className="mt-10 py-20" />
      ) : erroCarrinho ? (
        <EstadoVazio icone={ShoppingBag} titulo="Não foi possível carregar seu carrinho" descricao="Tente novamente em instantes." role="alert" className="mt-8">
          <button type="button" onClick={() => recarregar().catch(() => undefined)} className={classeBotao()}>Tentar novamente</button>
        </EstadoVazio>
      ) : itens.length === 0 ? (
        <EstadoVazio icone={ShoppingBag} titulo="Seu carrinho está vazio" descricao="Explore nossos produtos e adicione o que você gostar." className="mt-8">
          <Link to="/produtos" className={classeBotao()}>Ver produtos</Link>
        </EstadoVazio>
      ) : (
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {erro && <AlertaErro mensagem={erro} />}
            <ul className="divide-y divide-slate-100 overflow-hidden cartao">
              {itens.map((item) => (
                <LinhaItem
                  key={item.id_item_carrinho}
                  item={item}
                  produto={produtos.get(item.id_produto)}
                  ocupado={pendentes.has(item.id_item_carrinho)}
                  onQuantidade={(i, q) => executar(i.id_item_carrinho, () => atualizar(i.id_item_carrinho, q))}
                  onRemover={(i) => executar(i.id_item_carrinho, () => remover(i.id_item_carrinho))}
                />
              ))}
            </ul>
          </div>

          <aside className="cartao p-6 lg:sticky lg:top-44">
            <h2 className="titulo-secao">Resumo do Pedido</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Subtotal ({quantidadeTotal} {quantidadeTotal === 1 ? 'item' : 'itens'})</dt>
                <dd className="font-semibold">{formatarPreco(carrinho!.total)}</dd>
              </div>
            </dl>
            <div className="mt-5 flex items-end justify-between border-t border-slate-200 pt-5">
              <span className="font-semibold">Total:</span>
              <span className="font-display text-3xl font-extrabold text-brand-700">{formatarPreco(carrinho!.total)}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">O frete é informado na finalização do pedido.</p>

            {bloqueado && (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">Ajuste ou remova os itens indisponíveis para continuar.</p>
            )}
            {bloqueado ? (
              <button disabled className="mt-5 w-full cursor-not-allowed rounded-xl bg-success py-3.5 font-semibold text-white opacity-50">Fechar Pedido</button>
            ) : (
              <Link to="/checkout" className="mt-5 block w-full rounded-xl bg-success py-3.5 text-center font-semibold text-white transition hover:brightness-95">
                Fechar Pedido
              </Link>
            )}
            <Link to="/produtos" className="mt-4 block text-center text-sm font-semibold text-brand-600 hover:underline">Continuar Comprando</Link>
          </aside>
        </div>
      )}
    </div>
  )
}
