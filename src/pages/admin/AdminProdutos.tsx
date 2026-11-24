import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PackageSearch, Plus, Search } from 'lucide-react'
import { BotaoConfirmar } from '../../components/admin/BotaoConfirmar'
import { Aviso } from '../../components/ui/Aviso'
import { classeBotao } from '../../components/ui/botao'
import { Campo, CampoSelect } from '../../components/ui/Campo'
import { Carregando } from '../../components/ui/Carregando'
import { EstadoVazio } from '../../components/ui/EstadoVazio'
import { Miniatura } from '../../components/ui/Miniatura'
import { Paginacao } from '../../components/ui/Paginacao'
import { useConsulta } from '../../hooks/useConsulta'
import { atualizarProduto, listarCategoriasAdmin, listarMarcasAdmin, listarProdutosAdmin } from '../../lib/admin'
import { mensagemDe } from '../../lib/api'
import type { Produto } from '../../lib/catalogo'
import { formatarPreco } from '../../lib/formatar'

const LIMITE = 10

export default function AdminProdutos() {
  const [sp, setSp] = useSearchParams()
  const busca = sp.get('busca') ?? ''
  const categoria = sp.get('categoria') ?? ''
  const marca = sp.get('marca') ?? ''
  const inativos = sp.get('inativos') === '1'
  const pagina = Math.max(1, Number(sp.get('pagina')) || 1)

  const [texto, setTexto] = useState(busca)
  const [erroAcao, setErroAcao] = useState<string | null>(null)

  const query = new URLSearchParams({ limite: String(LIMITE), pagina: String(pagina), incluirInativos: String(inativos) })
  if (busca) query.set('busca', busca)
  if (categoria) query.set('categoria', categoria)
  if (marca) query.set('marca', marca)

  const { dados, erro, carregando, recarregar } = useConsulta(listarProdutosAdmin, query.toString())
  const categorias = useConsulta(listarCategoriasAdmin).dados ?? []
  const marcas = useConsulta(listarMarcasAdmin).dados ?? []

  const filtrar = (mudancas: Record<string, string | null>, novaPagina = 1) => {
    const novo = new URLSearchParams(sp)
    for (const [chave, valor] of Object.entries(mudancas)) {
      if (valor) novo.set(chave, valor)
      else novo.delete(chave)
    }
    if (novaPagina > 1) novo.set('pagina', String(novaPagina))
    else novo.delete('pagina')
    setSp(novo)
  }

  const buscar = (e: FormEvent) => {
    e.preventDefault()
    filtrar({ busca: texto.trim() || null })
  }

  const alternarAtivo = async (p: Produto) => {
    setErroAcao(null)
    try {
      await atualizarProduto(p.id_produto, { ativo: !p.ativo })
      await recarregar()
    } catch (e) {
      setErroAcao(mensagemDe(e, 'Não foi possível alterar o produto. Tente novamente.'))
    }
  }

  const totalPaginas = dados ? Math.ceil(dados.paginacao.total / dados.paginacao.limite) : 0

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="titulo-pagina">Produtos</h1>
        <Link to="/admin/produtos/novo" className={classeBotao('primario', 'sm', 'inline-flex items-center gap-2')}>
          <Plus size={16} /> Novo produto
        </Link>
      </div>

      <form onSubmit={buscar} className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_auto]">
        <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-1">
          <Campo label="Buscar pelo nome" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ex.: iPhone" className="flex-1" />
          <button type="submit" aria-label="Buscar" className={classeBotao('primario', 'sm', 'mb-0.5 flex items-center')}><Search size={16} /></button>
        </div>
        <CampoSelect label="Categoria" value={categoria} onChange={(e) => filtrar({ categoria: e.target.value || null })}>
          <option value="">Todas</option>
          {categorias.map((c) => <option key={c.id_categoria} value={c.id_categoria}>{c.nome}{c.ativo ? '' : ' (inativa)'}</option>)}
        </CampoSelect>
        <CampoSelect label="Marca" value={marca} onChange={(e) => filtrar({ marca: e.target.value || null })}>
          <option value="">Todas</option>
          {marcas.map((m) => <option key={m.id_marca} value={m.id_marca}>{m.nome}{m.ativo ? '' : ' (inativa)'}</option>)}
        </CampoSelect>
        <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold">
          <input type="checkbox" checked={inativos} onChange={(e) => filtrar({ inativos: e.target.checked ? '1' : null })} className="h-4 w-4 accent-brand-600" />
          Mostrar inativos
        </label>
      </form>

      {erroAcao && <Aviso tom="erro" className="mt-4">{erroAcao}</Aviso>}

      <div className="mt-6">
        {erro ? (
          <Aviso tom="erro">Não foi possível carregar os produtos. {erro.message}</Aviso>
        ) : carregando ? (
          <Carregando />
        ) : dados && dados.dados.length > 0 ? (
          <div className="cartao overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Categoria / marca</th>
                  <th className="px-4 py-3 text-right">Preço</th>
                  <th className="px-4 py-3 text-right">Estoque</th>
                  <th className="px-4 py-3">Situação</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dados.dados.map((p) => (
                  <tr key={p.id_produto} className={p.ativo ? '' : 'bg-slate-50 text-slate-500'}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Miniatura imagem={p.imagem} tamanho="sm" />
                        <span className="min-w-0"><span className="block font-semibold text-slate-900">{p.nome}</span><span className="text-xs text-slate-500">#{p.id_produto}</span></span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{p.categoria?.nome ?? '—'}<span className="block text-xs text-slate-500">{p.marca?.nome ?? '—'}</span></td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">{formatarPreco(p.preco)}</td>
                    <td className="px-4 py-3 text-right">{p.estoque}</td>
                    <td className="px-4 py-3">
                      <span className="flex flex-wrap gap-1.5">
                        <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${p.ativo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{p.ativo ? 'Ativo' : 'Inativo'}</span>
                        {p.destaque && <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-600">Destaque</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/produtos/${p.id_produto}`} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold transition hover:border-brand-600 hover:text-brand-600">Editar</Link>
                        {p.ativo ? (
                          <BotaoConfirmar rotulo="Inativar" pergunta="Inativar este produto?" aoConfirmar={() => alternarAtivo(p)} />
                        ) : (
                          <button type="button" onClick={() => alternarAtivo(p)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold transition hover:border-brand-600 hover:text-brand-600">Ativar</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EstadoVazio icone={PackageSearch} titulo="Nenhum produto encontrado" descricao="Ajuste a busca ou os filtros, ou cadastre um produto novo." />
        )}
        <Paginacao pagina={pagina} totalPaginas={totalPaginas} onChange={(p) => filtrar({}, p)} />
      </div>
    </div>
  )
}
