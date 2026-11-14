import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useComprarNovamente } from '../../hooks/useComprarNovamente'
import { useProdutosPorId } from '../../hooks/useProdutosPorId'
import { Miniatura } from '../ui/Miniatura'
import { dataLonga, formatarPreco } from '../../lib/formatar'
import { buscarPedido, type Pedido, type PedidoResumo } from '../../lib/pedidos'
import { ResultadoRecompra } from './ResultadoRecompra'
import { classeBotao } from '../ui/botao'
import { StatusBadge } from './StatusBadge'

const rotulo = 'text-[11px] font-semibold tracking-wide text-slate-500 uppercase'

export function CartaoPedido({ resumo }: { resumo: PedidoResumo }) {
  // undefined = carregando os itens; null = falhou
  const [detalhe, setDetalhe] = useState<Pedido | null | undefined>(undefined)
  const { executar, executando, resultado } = useComprarNovamente()

  useEffect(() => {
    let ativo = true
    buscarPedido(String(resumo.id_pedido))
      .then((p) => ativo && setDetalhe(p))
      .catch(() => ativo && setDetalhe(null))
    return () => {
      ativo = false
    }
  }, [resumo.id_pedido])

  const primeiro = detalhe?.itens[0]
  const produtos = useProdutosPorId(primeiro?.id_produto ? [primeiro.id_produto] : [])
  const aguardando = resumo.status === 'AGUARDANDO_PAGAMENTO'
  const totalItens = detalhe?.itens.reduce((s, i) => s + i.quantidade, 0) ?? 0
  const outros = (detalhe?.itens.length ?? 1) - 1

  return (
    <article className={`overflow-hidden rounded-2xl border bg-white ${aguardando ? 'border-brand-600' : 'border-slate-200'}`}>
      <header className={`flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4 ${aguardando ? 'border-brand-100 bg-brand-50' : 'border-slate-100 bg-slate-50'}`}>
        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div><dt className={rotulo}>Data do pedido</dt><dd className="font-semibold">{dataLonga(resumo.data)}</dd></div>
          <div><dt className={rotulo}>Valor total</dt><dd className="font-semibold">{formatarPreco(resumo.valor_total)}</dd></div>
          <div><dt className={rotulo}>Número do pedido</dt><dd className="font-semibold text-brand-600">#{resumo.id_pedido}</dd></div>
        </dl>
        <StatusBadge status={resumo.status} />
      </header>

      <div className="flex flex-wrap items-center gap-4 p-5">
        <Miniatura imagem={primeiro?.id_produto ? produtos.get(primeiro.id_produto)?.imagem : null} tamanho="lg" />

        <div className="min-w-0 flex-1 basis-48">
          {detalhe === undefined ? (
            <div className="space-y-2"><div className="h-4 w-48 animate-pulse rounded bg-slate-200" /><div className="h-3 w-32 animate-pulse rounded bg-slate-100" /></div>
          ) : primeiro ? (
            <>
              <p className="line-clamp-2 font-semibold">{primeiro.nome_produto}</p>
              <p className="mt-1 text-sm text-slate-500">
                Qtd: {totalItens}{outros > 0 ? ` · +${outros} ${outros === 1 ? 'outro produto' : 'outros produtos'}` : ''}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500">Não foi possível carregar os itens deste pedido.</p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {aguardando && (
            <Link to={`/checkout/pagamento/${resumo.id_pedido}`} className={classeBotao('primario', 'sm')}>
              Pagar Agora
            </Link>
          )}
          {!aguardando && detalhe && detalhe.itens.length > 0 && (
            <button
              onClick={() => executar(detalhe.itens)}
              disabled={executando}
              className={classeBotao('contorno', 'sm')}
            >
              {executando ? 'Adicionando...' : 'Comprar Novamente'}
            </button>
          )}
          <Link to={`/pedidos/${resumo.id_pedido}`} className={classeBotao('contorno', 'sm')}>
            Ver Detalhes
          </Link>
        </div>
      </div>

      {resultado && <div className="px-5 pb-5"><ResultadoRecompra resultado={resultado} /></div>}
    </article>
  )
}

export function CartaoPedidoSkeleton() {
  return <div className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
}
