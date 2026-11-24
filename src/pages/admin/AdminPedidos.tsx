import { Link, useSearchParams } from 'react-router-dom'
import { ReceiptText } from 'lucide-react'
import { AcoesDoPedido } from '../../components/admin/AcoesDoPedido'
import { StatusBadge } from '../../components/pedido/StatusBadge'
import { Aviso } from '../../components/ui/Aviso'
import { Carregando } from '../../components/ui/Carregando'
import { EstadoVazio } from '../../components/ui/EstadoVazio'
import { Paginacao } from '../../components/ui/Paginacao'
import { useConsulta } from '../../hooks/useConsulta'
import { listarTodosPedidos } from '../../lib/admin'
import { dataHora, formatarPreco } from '../../lib/formatar'
import { FILTROS_STATUS, STATUS_INFO, type StatusPedido } from '../../lib/pedidos'

const LIMITE = 10

export default function AdminPedidos() {
  const [sp, setSp] = useSearchParams()
  const statusParam = sp.get('status')
  const status = statusParam && statusParam in STATUS_INFO ? (statusParam as StatusPedido) : null
  const pagina = Math.max(1, Number(sp.get('pagina')) || 1)

  const query = new URLSearchParams({ limite: String(LIMITE), pagina: String(pagina) })
  if (status) query.set('status', status)
  const { dados, erro, carregando, recarregar } = useConsulta(listarTodosPedidos, query.toString())

  const mudar = (novoStatus: StatusPedido | null, novaPagina = 1) => {
    const novo = new URLSearchParams()
    if (novoStatus) novo.set('status', novoStatus)
    if (novaPagina > 1) novo.set('pagina', String(novaPagina))
    setSp(novo)
  }

  const totalPaginas = dados ? Math.ceil(dados.total / dados.limite) : 0

  return (
    <div>
      <h1 className="titulo-pagina">Pedidos</h1>
      <p className="mt-2 text-slate-600">Pedidos de todos os clientes, do mais recente para o mais antigo.</p>

      <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por status">
        {FILTROS_STATUS.map((f) => (
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

      <div className="mt-6">
        {erro ? (
          <Aviso tom="erro">Não foi possível carregar os pedidos. {erro.message}</Aviso>
        ) : carregando ? (
          <Carregando />
        ) : dados && dados.dados.length > 0 ? (
          <div className="cartao overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
                <tr><th className="px-4 py-3">Pedido</th><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-right">Ações</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dados.dados.map((p) => (
                  <tr key={p.id_pedido}>
                    <td className="px-4 py-3 align-top"><span className="block font-semibold text-slate-900">#{p.id_pedido}</span><span className="text-xs text-slate-500">{dataHora(p.data)}</span></td>
                    <td className="px-4 py-3 align-top">{p.cliente ? <><span className="block font-semibold">{p.cliente.nome}</span><span className="text-xs text-slate-500">{p.cliente.email}</span></> : <span className="text-slate-400">—</span>}</td>
                    <td className="px-4 py-3 align-top"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-right align-top whitespace-nowrap">{formatarPreco(p.valor_total)}</td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col items-end gap-2">
                        <Link to={`/admin/pedidos/${p.id_pedido}`} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold transition hover:border-brand-600 hover:text-brand-600">Detalhes</Link>
                        <AcoesDoPedido idPedido={p.id_pedido} status={p.status} aoMudar={recarregar} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EstadoVazio icone={ReceiptText} titulo="Nenhum pedido encontrado" descricao={status ? 'Não há pedidos com esse status.' : 'A loja ainda não recebeu pedidos.'} />
        )}
        <Paginacao pagina={pagina} totalPaginas={totalPaginas} onChange={(p) => mudar(status, p)} />
      </div>
    </div>
  )
}
