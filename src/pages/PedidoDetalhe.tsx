import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Clock, MapPin, PackageSearch, Truck } from 'lucide-react'
import { ResultadoRecompra } from '../components/pedido/ResultadoRecompra'
import { StatusBadge } from '../components/pedido/StatusBadge'
import { classeBotao } from '../components/ui/botao'
import { Carregando } from '../components/ui/Carregando'
import { EstadoVazio } from '../components/ui/EstadoVazio'
import { useComprarNovamente } from '../hooks/useComprarNovamente'
import { useConsulta } from '../hooks/useConsulta'
import { useProdutosPorId } from '../hooks/useProdutosPorId'
import { statusDe } from '../lib/api'
import { Miniatura } from '../components/ui/Miniatura'
import { formatarCep, linhaCidade, linhaRua } from '../lib/enderecos'
import { dataHora, dataLonga, formatarPreco } from '../lib/formatar'
import { buscarPedido, type Pedido, type StatusPedido } from '../lib/pedidos'

const ETAPAS: { status: StatusPedido; rotulo: string }[] = [
  { status: 'AGUARDANDO_PAGAMENTO', rotulo: 'Aguardando pagamento' },
  { status: 'PAGO', rotulo: 'Pago' },
  { status: 'ENVIADO', rotulo: 'Enviado' },
  { status: 'ENTREGUE', rotulo: 'Entregue' },
]

function LinhaDoTempo({ status }: { status: StatusPedido }) {
  const atual = ETAPAS.findIndex((e) => e.status === status)

  return (
    <ol className="flex items-start" aria-label="Andamento do pedido">
      {ETAPAS.map((etapa, i) => {
        const feita = i <= atual
        return (
          <li key={etapa.status} className="relative flex-1 text-center" aria-current={i === atual ? 'step' : undefined}>
            {i > 0 && <span className={`absolute top-3.5 right-1/2 h-0.5 w-full ${i <= atual ? 'bg-brand-600' : 'bg-slate-200'}`} />}
            <span className={`relative z-10 mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs ${feita ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {feita ? <Check size={14} /> : i + 1}
            </span>
            <span className={`mt-2 block px-1 text-xs font-semibold ${feita ? 'text-brand-600' : 'text-slate-400'}`}>{etapa.rotulo}</span>
          </li>
        )
      })}
    </ol>
  )
}

function Conteudo({ pedido }: { pedido: Pedido }) {
  const { executar, executando, resultado } = useComprarNovamente()
  const produtos = useProdutosPorId(pedido.itens.flatMap((i) => (i.id_produto === null ? [] : [i.id_produto])))
  const aguardando = pedido.status === 'AGUARDANDO_PAGAMENTO'
  const e = pedido.endereco

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="titulo-pagina">Pedido #{pedido.id_pedido}</h1>
          <p className="mt-1 text-slate-600">Feito em {dataLonga(pedido.data)}</p>
        </div>
        <StatusBadge status={pedido.status} />
      </div>

      {pedido.status === 'CANCELADO' ? (
        <p className="mt-6 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">Este pedido foi cancelado. Se foi por falta de pagamento, o estoque dos itens já voltou para a loja.</p>
      ) : (
        <div className="mt-8 cartao px-4 py-6"><LinhaDoTempo status={pedido.status} /></div>
      )}

      {aguardando && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-100 bg-brand-50 px-5 py-4">
          <p className="flex items-center gap-2 text-sm">
            <Clock size={16} className="text-brand-600" />
            {pedido.expira_em ? <>Pague até <strong>{dataHora(pedido.expira_em)}</strong> para garantir seus itens.</> : 'Este pedido aguarda o pagamento.'}
          </p>
          <Link to={`/checkout/pagamento/${pedido.id_pedido}`} className={classeBotao('primario', 'sm')}>Pagar Agora</Link>
        </div>
      )}

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        <section className="overflow-hidden cartao">
          <h2 className="border-b border-slate-100 px-6 py-4 titulo-card">Itens do pedido</h2>
          <ul className="divide-y divide-slate-100">
            {pedido.itens.map((item) => {
              const produto = item.id_produto === null ? null : produtos.get(item.id_produto)
              return (
                <li key={item.id_item} className="flex items-center gap-4 px-6 py-4">
                  <Miniatura imagem={produto?.imagem} tamanho="md" />
                  <span className="min-w-0 flex-1">
                    {item.id_produto !== null ? (
                      <Link to={`/produtos/${item.id_produto}`} className="line-clamp-2 font-semibold hover:text-brand-600">{item.nome_produto}</Link>
                    ) : (
                      <span className="font-semibold">{item.nome_produto}</span>
                    )}
                    <span className="block text-sm text-slate-500">Qtd: {item.quantidade} · {formatarPreco(item.preco_unitario)} cada</span>
                  </span>
                  <span className="titulo-card">{formatarPreco(item.quantidade * item.preco_unitario)}</span>
                </li>
              )
            })}
          </ul>
        </section>

        <aside className="space-y-6">
          <section className="cartao p-6">
            <h2 className="titulo-card">Resumo</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-600">Produtos</dt><dd className="font-semibold">{formatarPreco(pedido.valor_total - pedido.valor_frete)}</dd></div>
              {pedido.valor_frete > 0 && <div className="flex justify-between"><dt className="text-slate-600">Frete</dt><dd className="font-semibold">{formatarPreco(pedido.valor_frete)}</dd></div>}
            </dl>
            <div className="mt-4 flex items-end justify-between border-t border-slate-200 pt-4">
              <span className="font-semibold">Total</span>
              <span className="font-display text-2xl font-extrabold text-brand-700">{formatarPreco(pedido.valor_total)}</span>
            </div>
          </section>

          {e && (
            <section className="cartao p-6">
              <h2 className="flex items-center gap-2 titulo-card"><MapPin size={18} className="text-brand-600" /> Entrega</h2>
              <p className="mt-3 text-sm">{linhaRua(e)}</p>
              <p className="text-sm text-slate-600">{linhaCidade(e)}</p>
              <p className="text-sm text-slate-500">CEP {formatarCep(e.cep)}</p>
            </section>
          )}

          {(pedido.codigo_rastreio || pedido.metodo_envio) && (
            <section className="cartao p-6">
              <h2 className="flex items-center gap-2 titulo-card"><Truck size={18} className="text-brand-600" /> Envio</h2>
              <dl className="mt-3 space-y-1 text-sm">
                {pedido.metodo_envio && <div className="flex justify-between"><dt className="text-slate-600">Método</dt><dd className="font-semibold">{pedido.metodo_envio}</dd></div>}
                {pedido.prazo_entrega_dias != null && <div className="flex justify-between"><dt className="text-slate-600">Prazo</dt><dd className="font-semibold">{pedido.prazo_entrega_dias} dias</dd></div>}
                {pedido.codigo_rastreio && <div className="flex justify-between"><dt className="text-slate-600">Rastreio</dt><dd className="font-semibold">{pedido.codigo_rastreio}</dd></div>}
              </dl>
            </section>
          )}

          {!aguardando && pedido.itens.length > 0 && (
            <div>
              <button
                onClick={() => executar(pedido.itens)}
                disabled={executando}
                className={classeBotao('contornoRoxo', 'largo')}
              >
                {executando ? 'Adicionando...' : 'Comprar Novamente'}
              </button>
              {resultado && <ResultadoRecompra resultado={resultado} />}
            </div>
          )}
        </aside>
      </div>
    </>
  )
}

export default function PedidoDetalhe() {
  const { id = '' } = useParams()
  const { dados: pedido, erro, carregando } = useConsulta(buscarPedido, id)
  const inexistente = [400, 403, 404].includes(statusDe(erro))

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link to="/pedidos" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline">
        <ArrowLeft size={16} /> Meus pedidos
      </Link>

      {carregando ? (
        <Carregando rotulo="Carregando pedido" className="py-24" />
      ) : pedido ? (
        <Conteudo pedido={pedido} />
      ) : (
        <EstadoVazio
          nivel={1}
          icone={PackageSearch}
          titulo={inexistente ? 'Pedido não encontrado' : 'Não foi possível carregar o pedido'}
          descricao={inexistente ? 'Ele não existe ou não pertence à sua conta.' : 'Tente novamente em instantes.'}
        >
          <Link to="/pedidos" className={classeBotao()}>Ver meus pedidos</Link>
        </EstadoVazio>
      )}
    </div>
  )
}
