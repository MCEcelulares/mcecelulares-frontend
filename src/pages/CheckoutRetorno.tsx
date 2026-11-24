import { useEffect, type ReactNode } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Clock, Loader2, PackageSearch, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { classeBotao } from '../components/ui/botao'
import { Aviso } from '../components/ui/Aviso'
import { EstadoVazio } from '../components/ui/EstadoVazio'
import { useAcompanharPedido } from '../hooks/useAcompanharPedido'
import { useConfirmarPagamento } from '../hooks/useConfirmarPagamento'
import { lerRetornoMercadoPago } from '../lib/retornoMercadoPago'

/** Tempo para o cliente ler a confirmação antes de ser levado ao pedido. */
const ATRASO_PARA_O_PEDIDO_MS = 3000

interface ResultadoProps {
  icone: LucideIcon
  classeIcone: string
  titulo: string
  descricao: ReactNode
  /** Aviso extra, entre o texto e os botões. */
  aviso?: ReactNode
  children: ReactNode
}

function Resultado({ icone: Icone, classeIcone, titulo, descricao, aviso, children }: ResultadoProps) {
  return (
    <div role="status" className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center">
      <Icone size={60} className={classeIcone} />
      <h1 className="mt-5 font-display text-3xl font-extrabold">{titulo}</h1>
      <p className="mt-2 text-slate-600">{descricao}</p>
      {aviso && <div className="mt-6 w-full text-left">{aviso}</div>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  )
}

/**
 * Para onde o Mercado Pago devolve o cliente depois do Checkout Pro (`/checkout/retorno/:id?status=...`).
 * O que a URL diz é só uma dica de texto: o resultado vem do back-end, que confere o pagamento no Mercado Pago (ADR-011).
 */
export default function CheckoutRetorno() {
  const { id = '' } = useParams()
  const [parametros] = useSearchParams()
  const { resultado, verificarNovamente } = useConfirmarPagamento(id)
  const { dica } = lerRetornoMercadoPago(parametros)
  const navigate = useNavigate()

  // Pagamento aprovado leva ao pedido. `replace` tira esta tela (e a URL com os parâmetros do Mercado Pago) do histórico:
  // voltar ou atualizar a página não repete a confirmação. Sair antes cancela o temporizador.
  // Pendente: o back-end ainda espera o Mercado Pago. Acompanhamos o pedido, que o webhook atualiza, até ele ser pago.
  const pendente = resultado.situacao === 'pendente'
  const { status: statusPedido, esgotado } = useAcompanharPedido(id, pendente)
  const pagoNoAcompanhamento = pendente && (statusPedido === 'PAGO' || statusPedido === 'ENVIADO' || statusPedido === 'ENTREGUE')
  const aprovado = resultado.situacao === 'aprovado' || pagoNoAcompanhamento
  useEffect(() => {
    if (!aprovado) return
    const temporizador = setTimeout(() => navigate(`/pedidos/${id}`, { replace: true }), ATRASO_PARA_O_PEDIDO_MS)
    return () => clearTimeout(temporizador)
  }, [aprovado, id, navigate])

  const verPedido = <Link to={`/pedidos/${id}`} className={classeBotao()}>Ver meu pedido</Link>
  const verPedidoSecundario = <Link to={`/pedidos/${id}`} className={classeBotao('contorno')}>Ver meu pedido</Link>
  const continuar = <Link to="/produtos" className={classeBotao('contorno')}>Continuar comprando</Link>

  const telaAprovado = (
    <Resultado
      icone={CheckCircle2}
      classeIcone="text-success"
      titulo="Pagamento aprovado!"
      descricao={<>Seu pedido <strong>#{id}</strong> foi confirmado. Você será levado ao pedido em instantes.</>}
    >
      {verPedido}
      {continuar}
    </Resultado>
  )

  if (pagoNoAcompanhamento) return telaAprovado

  if (pendente && statusPedido === 'CANCELADO') {
    return (
      <Resultado
        icone={XCircle}
        classeIcone="text-red-500"
        titulo="Pedido cancelado"
        descricao="O prazo para pagar terminou e o pedido foi cancelado."
        aviso={<Aviso tom="atencao">Se você chegou a pagar, fale com a loja para combinar o reembolso.</Aviso>}
      >
        <Link to="/contato" className={classeBotao()}>Falar com a loja</Link>
        <Link to="/pedidos" className={classeBotao('contorno')}>Meus pedidos</Link>
      </Resultado>
    )
  }

  switch (resultado.situacao) {
    case 'confirmando':
      return (
        <div role="status" className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center text-brand-600">
          <Loader2 size={44} className="animate-spin" />
          <h1 className="mt-5 font-display text-2xl font-bold text-slate-900">Confirmando seu pagamento...</h1>
          <p className="mt-2 text-slate-600">Estamos conferindo o resultado com o Mercado Pago. Não feche esta página.</p>
        </div>
      )

    case 'aprovado':
      return telaAprovado

    case 'pendente':
      return (
        <Resultado
          icone={Clock}
          classeIcone="text-amber-500"
          titulo="Pagamento em processamento"
          descricao={
            dica === 'aprovado'
              ? 'O Mercado Pago indicou a aprovação e estamos aguardando a confirmação final. Isso costuma levar poucos instantes.'
              : 'Assim que o Mercado Pago confirmar o pagamento, seu pedido será atualizado. Pix e boleto podem levar mais tempo.'
          }
          aviso={
            esgotado ? (
              <Aviso tom="atencao">
                Ainda não recebemos a confirmação. Não é preciso pagar de novo: você pode verificar agora ou voltar mais tarde em Meus pedidos, que mostram o pagamento assim que ele for confirmado.
              </Aviso>
            ) : (
              <Aviso tom="info">
                Não é preciso pagar de novo. Esta página confere o pedido sozinha a cada poucos segundos e avisa quando o pagamento for confirmado.
              </Aviso>
            )
          }
        >
          <button type="button" onClick={verificarNovamente} className={classeBotao()}>Verificar agora</button>
          {verPedidoSecundario}
          {continuar}
        </Resultado>
      )

    case 'recusado':
      return (
        <Resultado
          icone={XCircle}
          classeIcone="text-red-500"
          titulo="Pagamento não aprovado"
          descricao="O Mercado Pago não aprovou este pagamento."
          aviso={<Aviso tom="atencao">Seu pedido continua reservado até o prazo. Tente de novo ou use outra forma de pagamento.</Aviso>}
        >
          <Link to={`/checkout/pagamento/${id}`} className={classeBotao()}>Tentar novamente</Link>
          {verPedidoSecundario}
        </Resultado>
      )

    case 'reembolsar':
      return (
        <Resultado
          icone={AlertTriangle}
          classeIcone="text-amber-500"
          titulo="Recebemos seu pagamento, mas não pudemos confirmar o pedido"
          descricao="Isso acontece quando o pedido já foi cancelado ou expirou."
          aviso={<Aviso tom="erro" titulo="Não pague novamente">Fale com a loja para combinar o reembolso.</Aviso>}
        >
          <Link to="/contato" className={classeBotao()}>Falar com a loja</Link>
          <Link to="/pedidos" className={classeBotao('contorno')}>Meus pedidos</Link>
        </Resultado>
      )

    case 'sem_pagamento':
      return (
        <EstadoVazio
          moldura={false}
          nivel={1}
          icone={PackageSearch}
          titulo="Não encontramos um pagamento para este pedido"
          descricao="Você ainda não iniciou o pagamento, ou o pedido não pertence à sua conta."
        >
          <Link to={`/checkout/pagamento/${id}`} className={classeBotao()}>Pagar agora</Link>
          <Link to="/pedidos" className={classeBotao('contorno')}>Meus pedidos</Link>
        </EstadoVazio>
      )

    case 'erro':
      return (
        <EstadoVazio
          moldura={false}
          nivel={1}
          role="alert"
          icone={AlertTriangle}
          titulo="Não foi possível confirmar o pagamento"
          descricao={resultado.mensagem}
        >
          {resultado.status !== 400 && (
            <button type="button" onClick={verificarNovamente} className={classeBotao()}>Tentar novamente</button>
          )}
          <Link to="/pedidos" className={classeBotao('contorno')}>Meus pedidos</Link>
        </EstadoVazio>
      )
  }
}
