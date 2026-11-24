import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, ImageOff, Loader2, Minus, PackageSearch, Plus, ShoppingBag } from 'lucide-react'
import { ProdutoCard } from '../components/produto/ProdutoCard'
import { classeBotao } from '../components/ui/botao'
import { EstadoVazio } from '../components/ui/EstadoVazio'
import { useAuth } from '../hooks/useAuth'
import { useCarrinho } from '../hooks/useCarrinho'
import { useConsulta } from '../hooks/useConsulta'
import { mensagemDe, statusDe, urlImagem } from '../lib/api'
import { buscarProduto, listarProdutos, type Produto } from '../lib/catalogo'
import { formatarPreco } from '../lib/formatar'

const MAX_QUANTIDADE = 10

function Disponibilidade({ estoque }: { estoque: number }) {
  if (estoque <= 0) {
    return <p className="flex items-center gap-2 text-sm font-semibold text-red-600"><span className="h-2 w-2 rounded-full bg-red-500" /> Indisponível no momento</p>
  }
  if (estoque <= 5) {
    return <p className="flex items-center gap-2 text-sm font-semibold text-amber-600"><span className="h-2 w-2 rounded-full bg-amber-500" /> Restam apenas {estoque} {estoque === 1 ? 'unidade' : 'unidades'}</p>
  }
  return <p className="flex items-center gap-2 text-sm font-semibold text-success"><span className="h-2 w-2 rounded-full bg-success" /> Em estoque</p>
}

function Quantidade({ estoque, valor, onChange }: { estoque: number; valor: number; onChange: (v: number) => void }) {
  const max = Math.min(estoque, MAX_QUANTIDADE)
  const botao = 'flex h-10 w-10 items-center justify-center text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'

  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white" role="group" aria-label="Quantidade">
      <button className={botao} onClick={() => onChange(valor - 1)} disabled={valor <= 1} aria-label="Diminuir quantidade"><Minus size={16} /></button>
      <span className="w-12 text-center text-sm font-semibold" aria-live="polite">{valor}</span>
      <button className={botao} onClick={() => onChange(valor + 1)} disabled={valor >= max} aria-label="Aumentar quantidade"><Plus size={16} /></button>
    </div>
  )
}

function Especificacoes({ produto }: { produto: Produto }) {
  const linhas: [string, string][] = []
  if (produto.marca) linhas.push(['Marca', produto.marca.nome])
  if (produto.categoria) linhas.push(['Categoria', produto.categoria.nome])
  if (produto.peso != null) linhas.push(['Peso', `${produto.peso} kg`])
  if (produto.altura != null) linhas.push(['Altura', `${produto.altura} cm`])
  if (produto.largura != null) linhas.push(['Largura', `${produto.largura} cm`])
  if (produto.comprimento != null) linhas.push(['Comprimento', `${produto.comprimento} cm`])
  linhas.push(['Código', `#${produto.id_produto}`])

  return (
    <dl className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white text-sm">
      {linhas.map(([rotulo, valor]) => (
        <div key={rotulo} className="grid grid-cols-[140px_1fr] px-4 py-3">
          <dt className="text-slate-500">{rotulo}</dt>
          <dd className="font-medium">{valor}</dd>
        </div>
      ))}
    </dl>
  )
}

function Relacionados({ produto }: { produto: Produto }) {
  const { dados } = useConsulta(listarProdutos, `categoria=${produto.id_categoria}&limite=5`)
  const itens = dados?.dados.filter((p) => p.id_produto !== produto.id_produto).slice(0, 4) ?? []
  if (itens.length === 0) return null

  return (
    <section className="mt-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-bold md:text-3xl">Produtos relacionados</h2>
        <Link to={`/produtos?categoria=${produto.id_categoria}`} className="shrink-0 text-sm font-semibold whitespace-nowrap text-brand-600 hover:underline">
          Ver categoria
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
        {itens.map((p) => <ProdutoCard key={p.id_produto} produto={p} />)}
      </div>
    </section>
  )
}

function Detalhe({ produto }: { produto: Produto }) {
  const { usuario } = useAuth()
  const { adicionar } = useCarrinho()
  const navigate = useNavigate()
  const [quantidade, setQuantidade] = useState(1)
  const [adicionando, setAdicionando] = useState(false)
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string } | null>(null)
  const imagem = urlImagem(produto.imagem)
  const indisponivel = produto.estoque <= 0

  const comprar = async () => {
    if (!usuario) {
      navigate('/login', { state: { from: `/produtos/${produto.id_produto}` } })
      return
    }
    setResultado(null)
    setAdicionando(true)
    try {
      await adicionar(produto.id_produto, quantidade)
      setResultado({ ok: true, texto: quantidade === 1 ? 'Produto adicionado ao carrinho.' : `${quantidade} unidades adicionadas ao carrinho.` })
    } catch (e) {
      setResultado({ ok: false, texto: mensagemDe(e, 'Não foi possível adicionar ao carrinho. Tente novamente.') })
    } finally {
      setAdicionando(false)
    }
  }

  useEffect(() => {
    document.title = `${produto.nome} | MCE Celulares`
    return () => { document.title = 'MCE Celulares' }
  }, [produto.nome])

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden cartao">
          {imagem ? (
            <img src={imagem} alt={produto.nome} className="absolute inset-0 h-full w-full object-contain p-8" />
          ) : (
            <ImageOff size={64} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" />
          )}
        </div>

        <div className="flex flex-col">
          {produto.marca && (
            <Link to={`/produtos?marca=${produto.marca.id_marca}`} className="text-sm font-bold tracking-wider text-brand-600 uppercase hover:underline">
              {produto.marca.nome}
            </Link>
          )}
          <h1 className="mt-2 font-display text-3xl leading-tight font-extrabold md:text-4xl">{produto.nome}</h1>

          <p className="mt-6 font-display text-4xl font-extrabold text-brand-700">{formatarPreco(produto.preco)}</p>
          <div className="mt-3"><Disponibilidade estoque={produto.estoque} /></div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {!indisponivel && <Quantidade estoque={produto.estoque} valor={quantidade} onChange={setQuantidade} />}
            <button
              onClick={comprar}
              disabled={indisponivel || adicionando}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 font-semibold whitespace-nowrap text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:w-auto"
            >
              {adicionando ? <Loader2 size={18} className="animate-spin" /> : <ShoppingBag size={18} />}
              {indisponivel ? 'Produto indisponível' : adicionando ? 'Adicionando...' : 'Adicionar ao carrinho'}
            </button>
          </div>

          {resultado && (
            <p role={resultado.ok ? 'status' : 'alert'} className={`mt-4 text-sm font-medium ${resultado.ok ? 'text-success' : 'text-red-600'}`}>
              {resultado.texto}{' '}
              {resultado.ok && <Link to="/carrinho" className="font-semibold text-brand-600 underline">Ver carrinho</Link>}
            </p>
          )}

          <div className="mt-10">
            <h2 className="mb-3 titulo-card">Sobre este produto</h2>
            <p className="leading-relaxed whitespace-pre-line text-slate-600">
              {produto.descricao || 'Este produto ainda não possui uma descrição.'}
            </p>
          </div>
        </div>
      </div>

      <section className="mt-14">
        <h2 className="mb-4 font-display text-2xl font-bold">Especificações</h2>
        <div className="max-w-2xl"><Especificacoes produto={produto} /></div>
      </section>

      <Relacionados produto={produto} />
    </>
  )
}

function Esqueleto() {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="aspect-square animate-pulse rounded-3xl bg-slate-100" />
      <div className="space-y-4">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
        <div className="h-24 w-full animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  )
}

export default function ProdutoDetalhe() {
  const { id = '' } = useParams()
  const { dados: produto, erro, carregando } = useConsulta(buscarProduto, id)
  const inexistente = [400, 404].includes(statusDe(erro))

  return (
    <div className="pagina py-8">
      <nav aria-label="Você está em" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-slate-500">
        <Link to="/" className="hover:text-brand-600">Início</Link>
        <ChevronRight size={14} />
        <Link to="/produtos" className="hover:text-brand-600">Produtos</Link>
        {produto?.categoria && (
          <>
            <ChevronRight size={14} />
            <Link to={`/produtos?categoria=${produto.categoria.id_categoria}`} className="hover:text-brand-600">{produto.categoria.nome}</Link>
          </>
        )}
        {produto && (
          <>
            <ChevronRight size={14} />
            <span className="font-medium text-brand-600">{produto.nome}</span>
          </>
        )}
      </nav>

      {carregando ? (
        <Esqueleto />
      ) : produto ? (
        <Detalhe key={produto.id_produto} produto={produto} />
      ) : (
        <EstadoVazio
          nivel={1}
          icone={PackageSearch}
          titulo={inexistente ? 'Produto não encontrado' : 'Não foi possível carregar o produto'}
          descricao={inexistente ? 'Ele pode ter sido removido ou o endereço está incorreto.' : 'Tente novamente em instantes.'}
        >
          <Link to="/produtos" className={classeBotao()}>Ver todos os produtos</Link>
        </EstadoVazio>
      )}
    </div>
  )
}
