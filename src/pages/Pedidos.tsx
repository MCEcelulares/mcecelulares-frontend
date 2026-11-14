import { Link, useSearchParams } from 'react-router-dom'
import { ReceiptText } from 'lucide-react'
import { CartaoPedido, CartaoPedidoSkeleton } from '../components/pedido/CartaoPedido'
import { classeBotao } from '../components/ui/botao'
import { EstadoVazio } from '../components/ui/EstadoVazio'
import { Paginacao } from '../components/ui/Paginacao'
import { useConsulta } from '../hooks/useConsulta'
import { listarPedidos, STATUS_INFO, type StatusPedido } from '../lib/pedidos'

const LIMITE = 8
const FILTROS: { valor: StatusPedido | null; rotulo: string }[] = [
  { valor: null, rotulo: 'Todos' },
  { valor: 'AGUARDANDO_PAGAMENTO', rotulo: 'Aguardando pagamento' },
  { valor: 'PAGO', rotulo: 'Pago' },
  { valor: 'ENVIADO', rotulo: 'Enviado' },
  { valor: 'ENTREGUE', rotulo: 'Entregue' },
  { valor: 'CANCELADO', rotulo: 'Cancelado' },
]

export default function Pedidos() {
  const [sp, setSp] = useSearchParams()
  const statusParam = sp.get('status')
  const status = statusParam && statusParam in STATUS_INFO ? (statusParam as StatusPedido) : null
  const pagina = Math.max(1, Number(sp.get('pagina')) || 1)

  const query = new URLSearchParams({ limite: String(LIMITE), pagina: String(pagina) })
  if (status) query.set('status', status)
  const { dados, erro, carregando } = useConsulta(listarPedidos, query.toString())

  const mudar = (novoStatus: StatusPedido | null, novaPagina = 1) => {
    const novo = new URLSearchParams()
    if (novoStatus) novo.set('status', novoStatus)
    if (novaPagina > 1) novo.set('pagina', String(novaPagina))
    setSp(novo)
  }

  const totalPaginas = dados ? Math.ceil(dados.total / dados.limite) : 0

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="titulo-pagina">Meus Pedidos</h1>

      <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por status">
        <span className="mr-1 text-sm font-semibold text-slate-600">Filtrar por:</span>
        {FILTROS.map((f) => (
          <button
            key={f.rotulo}
            onClick={() => mudar(f.valor)}
            aria-pressed={status === f.valor}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
              status === f.valor ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 bg-white hover:border-brand-600 hover:text-brand-600'
            }`}
          >
            {f.rotulo}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-5">
        {erro ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
            Não foi possível carregar seus pedidos. {erro.message}
          </div>
        ) : carregando ? (
          Array.from({ length: 3 }, (_, i) => <CartaoPedidoSkeleton key={i} />)
        ) : dados && dados.dados.length > 0 ? (
          <>
            {dados.dados.map((p) => <CartaoPedido key={p.id_pedido} resumo={p} />)}
            <Paginacao
              pagina={dados.pagina}
              totalPaginas={totalPaginas}
              onChange={(p) => {
                mudar(status, p)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          </>
        ) : (
          <EstadoVazio
            icone={ReceiptText}
            titulo={status ? 'Nenhum pedido com este status' : 'Você ainda não fez nenhum pedido'}
            descricao={status ? 'Escolha outro filtro para ver seus pedidos.' : 'Quando você comprar, seus pedidos aparecem aqui.'}
          >
            {status ? (
              <button onClick={() => mudar(null)} className={classeBotao()}>Ver todos os pedidos</button>
            ) : (
              <Link to="/produtos" className={classeBotao()}>Ver produtos</Link>
            )}
          </EstadoVazio>
        )}
      </div>
    </div>
  )
}
