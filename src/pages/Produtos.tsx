import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, SearchX, SlidersHorizontal, X } from 'lucide-react'
import { FiltrosProdutos, type FiltrosAtivos } from '../components/produto/FiltrosProdutos'
import { ProdutoCard, ProdutoCardSkeleton } from '../components/produto/ProdutoCard'
import { classeBotao } from '../components/ui/botao'
import { EstadoVazio } from '../components/ui/EstadoVazio'
import { Paginacao } from '../components/ui/Paginacao'
import { useCategorias } from '../hooks/useCategorias'
import { useConsulta } from '../hooks/useConsulta'
import { listarMarcas, listarProdutos } from '../lib/catalogo'
import { formatarPreco } from '../lib/formatar'

const LIMITE = 12
const CHAVES_API = ['categoria', 'marca', 'precoMin', 'precoMax', 'busca', 'disponivel', 'ordenar', 'pagina'] as const
const ORDENACOES = [
  { valor: 'recentes', rotulo: 'Mais recentes' },
  { valor: 'preco_asc', rotulo: 'Menor preço' },
  { valor: 'preco_desc', rotulo: 'Maior preço' },
]

export default function Produtos() {
  const [sp, setSp] = useSearchParams()
  const [filtrosAbertos, setFiltrosAbertos] = useState(false)
  const { categorias } = useCategorias()
  const { dados: marcas } = useConsulta(listarMarcas)

  const filtros: FiltrosAtivos = {
    categoria: sp.get('categoria'),
    marca: sp.get('marca'),
    precoMin: sp.get('precoMin'),
    precoMax: sp.get('precoMax'),
    disponivel: sp.get('disponivel') === 'true',
  }
  const busca = sp.get('busca')
  const ordenar = sp.get('ordenar') ?? 'recentes'
  const pagina = Math.max(1, Number(sp.get('pagina')) || 1)

  const query = new URLSearchParams()
  for (const chave of CHAVES_API) {
    const valor = sp.get(chave)
    if (valor) query.set(chave, valor)
  }
  query.set('limite', String(LIMITE))
  const { dados, erro, carregando } = useConsulta(listarProdutos, query.toString())

  const atualizar = (mudancas: Record<string, string | null>) => {
    const novo = new URLSearchParams(sp)
    for (const [chave, valor] of Object.entries(mudancas)) {
      if (valor === null || valor === '') novo.delete(chave)
      else novo.set(chave, valor)
    }
    if (!('pagina' in mudancas)) novo.delete('pagina')
    setSp(novo)
  }

  const limparTudo = () => setSp(new URLSearchParams())

  const nomeCategoria = categorias.find((c) => String(c.id_categoria) === filtros.categoria)?.nome
  const nomeMarca = marcas?.find((m) => String(m.id_marca) === filtros.marca)?.nome

  const chips: { rotulo: string; remover: Record<string, string | null> }[] = []
  if (busca) chips.push({ rotulo: `Busca: ${busca}`, remover: { busca: null } })
  if (nomeCategoria) chips.push({ rotulo: nomeCategoria, remover: { categoria: null } })
  if (nomeMarca) chips.push({ rotulo: nomeMarca, remover: { marca: null } })
  if (filtros.precoMin || filtros.precoMax) {
    const de = filtros.precoMin ? formatarPreco(Number(filtros.precoMin)) : null
    const ate = filtros.precoMax ? formatarPreco(Number(filtros.precoMax)) : null
    chips.push({
      rotulo: de && ate ? `${de} – ${ate}` : de ? `A partir de ${de}` : `Até ${ate}`,
      remover: { precoMin: null, precoMax: null },
    })
  }
  if (filtros.disponivel) chips.push({ rotulo: 'Em estoque', remover: { disponivel: null } })

  const titulo = busca ? `Resultados para “${busca}”` : (nomeCategoria ?? 'Todos os Produtos')
  const paginacao = dados?.paginacao
  const inicio = paginacao ? (paginacao.pagina - 1) * paginacao.limite + 1 : 0
  const fim = paginacao ? inicio + (dados?.dados.length ?? 0) - 1 : 0

  return (
    <div className="pagina py-8">
      <nav aria-label="Você está em" className="flex items-center gap-1 text-sm text-slate-500">
        <Link to="/" className="hover:text-brand-600">Início</Link>
        <ChevronRight size={14} />
        <span className={nomeCategoria || busca ? '' : 'font-medium text-brand-600'}>Produtos</span>
        {nomeCategoria && !busca && (
          <>
            <ChevronRight size={14} />
            <span className="font-medium text-brand-600">{nomeCategoria}</span>
          </>
        )}
      </nav>

      <h1 className="mt-3 titulo-pagina">{titulo}</h1>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-slate-200 py-4">
        <p className="text-sm text-slate-600">
          {paginacao && paginacao.total > 0 ? (
            <>
              Mostrando <strong>{inicio}-{fim}</strong> de <strong>{paginacao.total}</strong>{' '}
              {paginacao.total === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </>
          ) : carregando ? (
            'Carregando produtos...'
          ) : erro ? null : (
            'Nenhum produto encontrado'
          )}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFiltrosAbertos((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium lg:hidden"
            aria-expanded={filtrosAbertos}
          >
            <SlidersHorizontal size={16} /> Filtros
          </button>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span className="hidden sm:inline">Ordenar por:</span>
            <select
              value={ordenar}
              onChange={(e) => atualizar({ ordenar: e.target.value === 'recentes' ? null : e.target.value })}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-brand-600"
            >
              {ORDENACOES.map((o) => (
                <option key={o.valor} value={o.valor}>{o.rotulo}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[250px_1fr]">
        <aside className={`${filtrosAbertos ? 'block' : 'hidden'} lg:block`}>
          <FiltrosProdutos categorias={categorias} marcas={marcas ?? []} filtros={filtros} onChange={atualizar} />
        </aside>

        <div>
          {chips.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">Filtros ativos:</span>
              {chips.map((chip) => (
                <button
                  key={chip.rotulo}
                  onClick={() => atualizar(chip.remover)}
                  className="flex items-center gap-1.5 rounded-full border border-brand-600 bg-white px-3 py-1 text-sm font-medium text-brand-600 transition hover:bg-brand-50"
                  aria-label={`Remover filtro ${chip.rotulo}`}
                >
                  {chip.rotulo} <X size={14} />
                </button>
              ))}
              <button onClick={limparTudo} className="text-sm font-medium text-brand-600 underline">Limpar todos</button>
            </div>
          )}

          {erro ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
              Não foi possível carregar os produtos. {erro.message}
            </div>
          ) : carregando ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
              {Array.from({ length: 6 }, (_, i) => <ProdutoCardSkeleton key={i} />)}
            </div>
          ) : dados && dados.dados.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
                {dados.dados.map((p) => <ProdutoCard key={p.id_produto} produto={p} />)}
              </div>
              <Paginacao
                pagina={dados.paginacao.pagina}
                totalPaginas={dados.paginacao.totalPaginas}
                onChange={(p) => {
                  atualizar({ pagina: p === 1 ? null : String(p) })
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            </>
          ) : (
            <EstadoVazio icone={SearchX} titulo="Nenhum produto encontrado" descricao="Tente remover algum filtro ou buscar por outro termo.">
              {chips.length > 0 && (
                <button onClick={limparTudo} className={classeBotao()}>Limpar filtros</button>
              )}
            </EstadoVazio>
          )}
          {pagina > 1 && !carregando && dados && dados.dados.length === 0 && dados.paginacao.total > 0 && (
            <p className="mt-4 text-center text-sm text-slate-500">Esta página não existe.</p>
          )}
        </div>
      </div>
    </div>
  )
}
