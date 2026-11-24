import { apiAutenticada } from './auth'

export type StatusPedido = 'AGUARDANDO_PAGAMENTO' | 'PAGO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO'

export interface ItemPedido {
  id_item: number
  id_produto: number | null
  nome_produto: string
  quantidade: number
  preco_unitario: number
}

export const STATUS_INFO: Record<StatusPedido, { rotulo: string; classe: string }> = {
  AGUARDANDO_PAGAMENTO: { rotulo: 'Aguardando pagamento', classe: 'bg-red-50 text-red-600' },
  PAGO: { rotulo: 'Pago', classe: 'bg-brand-50 text-brand-600' },
  ENVIADO: { rotulo: 'Enviado', classe: 'bg-sky-50 text-sky-700' },
  ENTREGUE: { rotulo: 'Entregue', classe: 'bg-emerald-50 text-emerald-600' },
  CANCELADO: { rotulo: 'Cancelado', classe: 'bg-slate-100 text-slate-600' },
}

export interface PedidoResumo {
  id_pedido: number
  data: string
  status: StatusPedido
  valor_total: number
  valor_frete: number
}

export interface PedidosPagina {
  dados: PedidoResumo[]
  pagina: number
  limite: number
  total: number
}

export interface Pedido {
  id_pedido: number
  data: string
  status: StatusPedido
  valor_total: number
  valor_frete: number
  expira_em: string | null
  metodo_envio?: string | null
  prazo_entrega_dias?: number | null
  codigo_rastreio?: string | null
  itens: ItemPedido[]
  endereco: {
    endereco: string
    numero: string
    complemento: string | null
    bairro: string | null
    cidade: string
    estado: string
    cep: string
  } | null
}

const normalizar = (p: Pedido): Pedido => ({
  ...p,
  valor_total: Number(p.valor_total),
  valor_frete: Number(p.valor_frete),
  itens: (p.itens ?? []).map((i) => ({ ...i, preco_unitario: Number(i.preco_unitario) })),
})

export const listarPedidos = (query: string) =>
  apiAutenticada<PedidosPagina>(`/vendas/pedidos?${query}`).then((p) => ({
    ...p,
    dados: p.dados.map((d) => ({ ...d, valor_total: Number(d.valor_total), valor_frete: Number(d.valor_frete) })),
  }))

export const criarPedido = (idEndereco: number) =>
  apiAutenticada<Pedido>('/vendas/pedidos', { method: 'POST', json: { idEndereco } }).then(normalizar)

export const buscarPedido = (id: string) =>
  apiAutenticada<Pedido>(`/vendas/pedidos/${encodeURIComponent(id)}`).then(normalizar)

export const FILTROS_STATUS: { valor: StatusPedido | null; rotulo: string }[] = [
  { valor: null, rotulo: 'Todos' },
  { valor: 'AGUARDANDO_PAGAMENTO', rotulo: 'Aguardando pagamento' },
  { valor: 'PAGO', rotulo: 'Pago' },
  { valor: 'ENVIADO', rotulo: 'Enviado' },
  { valor: 'ENTREGUE', rotulo: 'Entregue' },
  { valor: 'CANCELADO', rotulo: 'Cancelado' },
]
