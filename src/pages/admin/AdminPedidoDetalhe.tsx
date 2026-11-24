import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, PackageSearch } from 'lucide-react'
import { AcoesDoPedido } from '../../components/admin/AcoesDoPedido'
import { StatusBadge } from '../../components/pedido/StatusBadge'
import { classeBotao } from '../../components/ui/botao'
import { Carregando } from '../../components/ui/Carregando'
import { EstadoVazio } from '../../components/ui/EstadoVazio'
import { useConsulta } from '../../hooks/useConsulta'
import { buscarPedidoAdmin } from '../../lib/admin'
import { statusDe } from '../../lib/api'
import { formatarCep, linhaCidade, linhaRua } from '../../lib/enderecos'
import { dataHora, formatarPreco } from '../../lib/formatar'
import { mascararTelefone } from '../../lib/mascaras'

export default function AdminPedidoDetalhe() {
  const { id = '' } = useParams()
  const { dados: pedido, erro, carregando, recarregar } = useConsulta(buscarPedidoAdmin, id)

  if (carregando) return <Carregando />
  if (erro || !pedido) {
    const naoExiste = [400, 404].includes(statusDe(erro))
    return (
      <EstadoVazio moldura={false} nivel={1} role="alert" icone={PackageSearch} titulo={naoExiste ? 'Pedido não encontrado' : 'Não foi possível carregar o pedido'} descricao={naoExiste ? 'Ele não existe ou o endereço está errado.' : erro?.message}>
        <Link to="/admin/pedidos" className={classeBotao()}>Voltar aos pedidos</Link>
      </EstadoVazio>
    )
  }

  const e = pedido.endereco
  const c = pedido.cliente

  return (
    <div>
      <Link to="/admin/pedidos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline"><ArrowLeft size={16} /> Pedidos</Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="titulo-pagina">Pedido #{pedido.id_pedido}</h1>
          <p className="mt-1 text-slate-600">Feito em {dataHora(pedido.data)}</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <StatusBadge status={pedido.status} />
          <AcoesDoPedido idPedido={pedido.id_pedido} status={pedido.status} aoMudar={recarregar} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="cartao p-6" aria-labelledby="titulo-cliente">
          <h2 id="titulo-cliente" className="titulo-card">Cliente</h2>
          {c ? (
            <div className="mt-3 space-y-0.5 text-sm">
              <p className="font-semibold">{c.nome}</p>
              <p className="text-slate-600">{c.email}</p>
              {c.telefone && <p className="text-slate-600">{mascararTelefone(c.telefone)}</p>}
              {c.id_usuario !== null && <Link to={`/admin/usuarios/${c.id_usuario}`} className="mt-2 inline-block font-semibold text-brand-600 hover:underline">Ver o usuário</Link>}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Dados do cliente indisponíveis.</p>
          )}
        </section>
        <section className="cartao p-6" aria-labelledby="titulo-entrega">
          <h2 id="titulo-entrega" className="titulo-card">Entrega</h2>
          {e ? (
            <div className="mt-3 space-y-0.5 text-sm">
              <p className="font-semibold">{linhaRua(e)}</p>
              <p className="text-slate-600">{linhaCidade(e)}</p>
              <p className="text-slate-500">CEP {formatarCep(e.cep)}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Endereço indisponível.</p>
          )}
        </section>
      </div>

      <section className="cartao mt-6 overflow-x-auto" aria-labelledby="titulo-itens">
        <h2 id="titulo-itens" className="titulo-card px-6 pt-6">Itens</h2>
        <table className="mt-3 w-full min-w-[520px] text-left text-sm">
          <thead className="border-y border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
            <tr><th className="px-6 py-3">Produto</th><th className="px-4 py-3 text-right">Qtd.</th><th className="px-4 py-3 text-right">Preço</th><th className="px-6 py-3 text-right">Subtotal</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pedido.itens.map((i) => (
              <tr key={i.id_item}>
                <td className="px-6 py-3 font-semibold">{i.nome_produto}</td>
                <td className="px-4 py-3 text-right">{i.quantidade}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">{formatarPreco(i.preco_unitario)}</td>
                <td className="px-6 py-3 text-right whitespace-nowrap">{formatarPreco(i.preco_unitario * i.quantidade)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-slate-200 text-sm">
            <tr><td colSpan={3} className="px-6 pt-3 text-right text-slate-600">Frete</td><td className="px-6 pt-3 text-right whitespace-nowrap">{formatarPreco(pedido.valor_frete)}</td></tr>
            <tr><td colSpan={3} className="px-6 py-3 text-right font-bold">Total</td><td className="px-6 py-3 text-right font-bold whitespace-nowrap">{formatarPreco(pedido.valor_total)}</td></tr>
          </tfoot>
        </table>
      </section>
      {pedido.status === 'AGUARDANDO_PAGAMENTO' && pedido.expira_em && (
        <p className="mt-4 text-sm text-slate-600">Aguardando pagamento até {dataHora(pedido.expira_em)}; depois disso o pedido é cancelado e o estoque volta para a loja.</p>
      )}
    </div>
  )
}
