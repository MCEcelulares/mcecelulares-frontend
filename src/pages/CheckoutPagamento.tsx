import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Clock, MapPin, PackageSearch, ShieldCheck } from 'lucide-react'
import { ResumoItens } from '../components/checkout/ResumoItens'
import { Aviso, type TomAviso } from '../components/ui/Aviso'
import { classeBotao } from '../components/ui/botao'
import { Carregando } from '../components/ui/Carregando'
import { EstadoVazio } from '../components/ui/EstadoVazio'
import { useProdutosPorId } from '../hooks/useProdutosPorId'
import { mensagemDe, statusDe } from '../lib/api'
import { formatarCep, linhaCidade, linhaRua } from '../lib/enderecos'
import { dataHora, formatarPreco } from '../lib/formatar'
import { forcarPagamento, iniciarPagamento, pagamentoForcadoHabilitado, urlDePagamentoSegura } from '../lib/pagamentos'
import { buscarPedido, type Pedido } from '../lib/pedidos'

type Carga = { id: string; pedido: Pedido | null; erro: boolean }

function Centralizado({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center">{children}</div>
}

export default function CheckoutPagamento() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [carga, setCarga] = useState<Carga | null>(null)
  const [pagando, setPagando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tom: TomAviso; texto: string } | null>(null)
  const [aprovado, setAprovado] = useState(false)
  const [tentativa, setTentativa] = useState(0)
  const [redirecionando, setRedirecionando] = useState(false)

  useEffect(() => {
    let ativo = true
    buscarPedido(id)
      .then((pedido) => ativo && setCarga({ id, pedido, erro: false }))
      .catch((e: unknown) => ativo && setCarga({ id, pedido: null, erro: ![403, 404].includes(statusDe(e)) }))
    return () => {
      ativo = false
    }
  }, [id, tentativa])

  useEffect(() => {
    const aoMostrar = (e: PageTransitionEvent) => {
      if (!e.persisted) return
      setRedirecionando(false)
      setPagando(false)
    }
    window.addEventListener('pageshow', aoMostrar)
    return () => window.removeEventListener('pageshow', aoMostrar)
  }, [])

  const carregarDeNovo = () => {
    setCarga(null)
    setTentativa((t) => t + 1)
  }

  const atual = carga?.id === id ? carga : null
  const idsProdutos = atual?.pedido?.itens.flatMap((i) => (i.id_produto === null ? [] : [i.id_produto])) ?? []
  const produtos = useProdutosPorId(idsProdutos)

  if (!atual) {
    return <Carregando />
  }

  const pedido = atual.pedido
  if (!pedido && atual.erro) {
    return (
      <EstadoVazio
        moldura={false}
        nivel={1}
        role="alert"
        icone={AlertTriangle}
        titulo="Não foi possível carregar o pedido"
        descricao="Verifique sua conexão e tente de novo. Seu pedido não foi alterado."
      >
        <button type="button" onClick={carregarDeNovo} className={classeBotao()}>Tentar novamente</button>
        <Link to="/pedidos" className={classeBotao('contorno')}>Meus pedidos</Link>
      </EstadoVazio>
    )
  }

  if (!pedido) {
    return (
      <EstadoVazio moldura={false} nivel={1} icone={PackageSearch} titulo="Pedido não encontrado" descricao="Ele não existe ou não pertence à sua conta.">
        <Link to="/produtos" className={classeBotao()}>Ver produtos</Link>
      </EstadoVazio>
    )
  }

  const pago = aprovado || ['PAGO', 'ENVIADO', 'ENTREGUE'].includes(pedido.status)
  if (pago) {
    return (
      <Centralizado>
        <CheckCircle2 size={60} className="text-success" />
        <h1 className="mt-5 font-display text-3xl font-extrabold">Pagamento aprovado!</h1>
        <p className="mt-2 text-slate-600">
          Seu pedido <strong>#{pedido.id_pedido}</strong> foi confirmado. Valor pago: <strong>{formatarPreco(pedido.valor_total)}</strong>.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to={`/pedidos/${pedido.id_pedido}`} className={classeBotao()}>Ver meu pedido</Link>
          <Link to="/produtos" className={classeBotao('contorno')}>Continuar comprando</Link>
        </div>
      </Centralizado>
    )
  }

  if (pedido.status === 'CANCELADO') {
    return (
      <EstadoVazio
        moldura={false}
        nivel={1}
        icone={Clock}
        titulo="Este pedido foi cancelado"
        descricao="O prazo para pagamento terminou ou o pedido foi cancelado. Monte um novo carrinho para comprar."
      >
        <Link to="/produtos" className={classeBotao()}>Ver produtos</Link>
      </EstadoVazio>
    )
  }

  const pagar = async () => {
    setMensagem(null)
    setPagando(true)
    const aba = window.open('about:blank', '_blank')
    if (aba) aba.opener = null
    let redirecionou = false
    try {
      const pagamento = await iniciarPagamento(pedido.id_pedido, pedido.valor_total)
      if (pagamento.url_pagamento) {
        if (!urlDePagamentoSegura(pagamento.url_pagamento)) {
          aba?.close()
          setMensagem({ tom: 'erro', texto: 'Não foi possível abrir o Mercado Pago. Tente novamente em instantes.' })
          return
        }
        redirecionou = true
        if (aba) {
          aba.location.href = pagamento.url_pagamento
          navigate(`/pedidos/${pedido.id_pedido}`)
          return
        }
        setRedirecionando(true)
        window.location.assign(pagamento.url_pagamento)
        return
      }
      aba?.close()
      if (pagamento.status === 'APROVADO') setAprovado(true)
      else if (pagamento.status === 'RECUSADO') setMensagem({ tom: 'atencao', texto: 'O pagamento foi recusado. Você pode tentar novamente.' })
      else setMensagem({ tom: 'info', texto: 'Seu pagamento está em processamento. Aguarde a confirmação.' })
    } catch (e) {
      aba?.close()
      setMensagem({ tom: 'erro', texto: mensagemDe(e, 'Não foi possível processar o pagamento. Tente novamente.') })
    } finally {
      if (!redirecionou) setPagando(false)
    }
  }

  const confirmarSemGateway = async () => {
    setMensagem(null)
    setPagando(true)
    try {
      await forcarPagamento(pedido.id_pedido)
      setAprovado(true)
    } catch (e) {
      setMensagem({ tom: 'erro', texto: mensagemDe(e, 'Não foi possível confirmar o pagamento. Tente novamente.') })
    } finally {
      setPagando(false)
    }
  }

  const resumo = pedido.itens.map((i) => ({
    chave: i.id_item,
    nome: i.nome_produto,
    quantidade: i.quantidade,
    precoUnitario: i.preco_unitario,
    imagem: (i.id_produto !== null && produtos.get(i.id_produto)?.imagem) || null,
  }))
  const e = pedido.endereco

  return (
    <div className="pagina py-10">
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <h1 className="titulo-pagina">Pagamento</h1>

          {pedido.expira_em && (
            <Aviso tom="atencao" icone={Clock}>
              Pedido <strong>#{pedido.id_pedido}</strong> reservado. Pague até <strong>{dataHora(pedido.expira_em)}</strong> para garantir seus itens.
            </Aviso>
          )}

          {e && (
            <section className="cartao p-6">
              <h2 className="flex items-center gap-2 titulo-card"><MapPin size={18} className="text-brand-600" /> Entrega</h2>
              <p className="mt-3 text-sm">{linhaRua(e)}</p>
              <p className="text-sm text-slate-600">{linhaCidade(e)} · CEP {formatarCep(e.cep)}</p>
            </section>
          )}

          <section className="cartao p-6">
            <h2 className="flex items-center gap-2 titulo-card"><ShieldCheck size={18} className="text-success" /> Forma de pagamento</h2>
            <p className="mt-3 text-sm text-slate-600">Ao clicar em <strong>Pagar agora</strong>, seu pagamento é processado com segurança. O Mercado Pago abre em uma nova aba, e esta aba passa a mostrar seu pedido.</p>
          </section>
        </div>

        <ResumoItens
          itens={resumo}
          subtotal={pedido.valor_total - pedido.valor_frete}
          frete={pedido.valor_frete}
          total={pedido.valor_total}
          acao={
            <div className="space-y-3">
              {mensagem && <Aviso tom={mensagem.tom}>{mensagem.texto}</Aviso>}
              <button
                onClick={pagar}
                disabled={pagando}
                className="w-full rounded-xl bg-success py-3.5 font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {redirecionando ? 'Redirecionando para o Mercado Pago...' : pagando ? 'Processando...' : `Pagar agora ${formatarPreco(pedido.valor_total)}`}
              </button>
              {pagamentoForcadoHabilitado && (
                <button
                  type="button"
                  onClick={confirmarSemGateway}
                  disabled={pagando}
                  className="w-full rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Confirmar pagamento sem Mercado Pago (demonstração)
                </button>
              )}
              <p className="text-center text-xs text-slate-500">
                Já pagou e fechou a janela do Mercado Pago?{' '}
                <Link to={`/checkout/retorno/${pedido.id_pedido}`} className="font-semibold text-brand-600 hover:underline">Conferir pagamento</Link>
              </p>
            </div>
          }
        />
      </div>
    </div>
  )
}
