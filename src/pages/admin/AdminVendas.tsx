import { useState } from 'react'
import { BarChart3, Package } from 'lucide-react'
import { Aviso } from '../../components/ui/Aviso'
import { CampoSelect } from '../../components/ui/Campo'
import { Carregando } from '../../components/ui/Carregando'
import { EstadoVazio } from '../../components/ui/EstadoVazio'
import { useConsulta } from '../../hooks/useConsulta'
import { maisVendidos, resumoDeVendas } from '../../lib/admin'
import { formatarPreco } from '../../lib/formatar'
import { STATUS_INFO, type StatusPedido } from '../../lib/pedidos'

const JANELAS = [7, 30, 90]
const MAIS_VENDIDOS = 10

const diaMes = (dia: string) => {
  const [, mes, d] = dia.split('-')
  return `${d}/${mes}`
}

function Cartao({ rotulo, valor, detalhe }: { rotulo: string; valor: string; detalhe?: string }) {
  return (
    <div className="cartao p-5">
      <p className="text-sm font-semibold text-slate-500">{rotulo}</p>
      <p className="mt-2 font-display text-2xl font-extrabold">{valor}</p>
      {detalhe && <p className="mt-1 text-xs text-slate-500">{detalhe}</p>}
    </div>
  )
}

export default function AdminVendas() {
  const [dias, setDias] = useState(30)
  const resumo = useConsulta(resumoDeVendas, dias)
  const top = useConsulta(maisVendidos, MAIS_VENDIDOS)

  const r = resumo.dados
  const maiorReceita = Math.max(1, ...(r?.receita_por_dia.map((d) => d.receita) ?? []))
  const status = Object.keys(STATUS_INFO) as StatusPedido[]

  return (
    <div>
      <h1 className="titulo-pagina">Painel de vendas</h1>
      <p className="mt-2 text-slate-600">A receita conta só pedidos pagos, enviados e entregues.</p>

      {resumo.erro ? (
        <Aviso tom="erro" className="mt-6">Não foi possível carregar o resumo. {resumo.erro.message}</Aviso>
      ) : !r ? (
        <Carregando />
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Cartao rotulo="Receita total" valor={formatarPreco(r.receita_total)} detalhe="Desde o primeiro pedido" />
            <Cartao rotulo="Pedidos" valor={String(r.total_pedidos)} detalhe="Todos os status" />
            <Cartao rotulo="Pedidos nas últimas 24 h" valor={String(r.pedidos_ultimas_24h)} />
          </div>

          <section className="mt-6" aria-labelledby="titulo-status">
            <h2 id="titulo-status" className="titulo-secao">Pedidos por status</h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-3">
              {status.map((s) => (
                <li key={s} className="cartao p-4">
                  <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold uppercase ${STATUS_INFO[s].classe}`}>{STATUS_INFO[s].rotulo}</span>
                  <p className="mt-2 font-display text-2xl font-extrabold">{r.pedidos_por_status[s] ?? 0}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="cartao mt-6 p-6" aria-labelledby="titulo-receita">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="titulo-receita" className="titulo-secao">Receita por dia</h2>
              <CampoSelect label="Período" value={String(dias)} onChange={(e) => setDias(Number(e.target.value))} className="w-44">
                {JANELAS.map((j) => <option key={j} value={j}>Últimos {j} dias</option>)}
              </CampoSelect>
            </div>
            {r.receita_por_dia.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">Nenhuma venda nesse período.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {r.receita_por_dia.map((d) => (
                  <li key={d.dia} className="grid grid-cols-[3.5rem_1fr] items-center gap-x-3 gap-y-0.5 text-sm sm:grid-cols-[3.5rem_1fr_auto]">
                    <span className="text-slate-500">{diaMes(d.dia)}</span>
                    <span className="h-3 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-brand-600" style={{ width: `${Math.max(2, (d.receita / maiorReceita) * 100)}%` }} /></span>
                    <span className="col-span-2 text-right font-semibold sm:col-span-1 sm:whitespace-nowrap">{formatarPreco(d.receita)} <span className="font-normal text-slate-500">({d.pedidos} {d.pedidos === 1 ? 'pedido' : 'pedidos'})</span></span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <section className="cartao mt-6 overflow-x-auto" aria-labelledby="titulo-top">
        <h2 id="titulo-top" className="titulo-secao px-6 pt-6">Produtos mais vendidos</h2>
        {top.erro ? (
          <div className="p-6"><Aviso tom="erro">Não foi possível carregar a lista. {top.erro.message}</Aviso></div>
        ) : !top.dados ? (
          <Carregando />
        ) : top.dados.length === 0 ? (
          <div className="p-6"><EstadoVazio moldura={false} icone={Package} titulo="Ainda não há vendas" descricao="Os produtos mais vendidos aparecem aqui assim que houver pedidos pagos." /></div>
        ) : (
          <table className="mt-3 w-full min-w-[480px] text-left text-sm">
            <thead className="border-y border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
              <tr><th className="px-6 py-3">#</th><th className="px-4 py-3">Produto</th><th className="px-4 py-3 text-right">Vendidos</th><th className="px-6 py-3 text-right">Receita</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {top.dados.map((p, i) => (
                <tr key={`${p.id_produto}-${i}`}>
                  <td className="px-6 py-3 text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold">{p.nome_produto}</td>
                  <td className="px-4 py-3 text-right">{p.quantidade_vendida}</td>
                  <td className="px-6 py-3 text-right whitespace-nowrap">{formatarPreco(p.receita)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-500"><BarChart3 size={14} /> Os dias seguem o relógio do banco de dados (UTC).</p>
    </div>
  )
}
