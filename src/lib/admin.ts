import { apiAutenticada } from './auth'
import type { Perfil } from './auth'
import type { Categoria, InfoPagina, Marca, Produto, ProdutosPagina } from './catalogo'
import type { Pedido, PedidoResumo, StatusPedido } from './pedidos'

const normalizarProduto = (p: Produto): Produto => ({ ...p, preco: Number(p.preco) })

export const listarProdutosAdmin = (query: string) =>
  apiAutenticada<ProdutosPagina>(`/catalogo/produtos?${query}`).then((p) => ({ ...p, dados: p.dados.map(normalizarProduto) }))

export const buscarProdutoAdmin = (id: string) =>
  apiAutenticada<Produto>(`/catalogo/produtos/${encodeURIComponent(id)}?incluirInativos=true`).then(normalizarProduto)

export interface DadosProduto {
  nome: string
  descricao: string | null
  preco: number
  estoque: number
  destaque: boolean
  ativo: boolean
  id_marca: number
  id_categoria: number
}

export const criarProduto = (dados: DadosProduto) =>
  apiAutenticada<Produto>('/catalogo/produtos', { method: 'POST', json: dados }).then(normalizarProduto)

export const atualizarProduto = (id: number, dados: Partial<DadosProduto>) =>
  apiAutenticada<Produto>(`/catalogo/produtos/${id}`, { method: 'PATCH', json: dados }).then(normalizarProduto)

export const listarCategoriasAdmin = () => apiAutenticada<Categoria[]>('/catalogo/categorias?incluirInativos=true')
export const listarMarcasAdmin = () => apiAutenticada<Marca[]>('/catalogo/marcas?incluirInativos=true')

export interface DadosSimples {
  nome: string
  ativo: boolean
}

export const criarCategoria = (dados: DadosSimples) => apiAutenticada<Categoria>('/catalogo/categorias', { method: 'POST', json: dados })
export const atualizarCategoria = (id: number, dados: Partial<DadosSimples>) =>
  apiAutenticada<Categoria>(`/catalogo/categorias/${id}`, { method: 'PATCH', json: dados })
export const excluirCategoria = (id: number) => apiAutenticada<void>(`/catalogo/categorias/${id}`, { method: 'DELETE' })

export const criarMarca = (dados: DadosSimples) => apiAutenticada<Marca>('/catalogo/marcas', { method: 'POST', json: dados })
export const atualizarMarca = (id: number, dados: Partial<DadosSimples>) =>
  apiAutenticada<Marca>(`/catalogo/marcas/${id}`, { method: 'PATCH', json: dados })
export const excluirMarca = (id: number) => apiAutenticada<void>(`/catalogo/marcas/${id}`, { method: 'DELETE' })

export const ajustarEstoque = (id: number, ajuste: number) =>
  apiAutenticada<Produto>(`/catalogo/produtos/${id}/estoque`, { method: 'PATCH', json: { ajuste } }).then(normalizarProduto)

export const enviarImagem = (id: number, arquivo: File) => {
  const corpo = new FormData()
  corpo.append('imagem', arquivo)
  return apiAutenticada<{ id_produto: number; imagem: string }>(`/catalogo/produtos/${id}/imagem`, { method: 'POST', formData: corpo })
}

export const removerImagem = (id: number) => apiAutenticada<void>(`/catalogo/produtos/${id}/imagem`, { method: 'DELETE' })

export interface UsuarioResumo {
  id_usuario: number
  nome: string
  email: string
  cpf: string | null
  telefone: string | null
  ativo: boolean
  provedor: string
  email_verificado: boolean
  cargos: { id_cargo: number; nome: string }[]
}

export interface UsuariosPagina {
  dados: UsuarioResumo[]
  paginacao: InfoPagina
}

export interface Cargo {
  id_cargo: number
  nome: string
  protegido: boolean
  permissoes: string[]
}

export const listarUsuarios = (query: string) => apiAutenticada<UsuariosPagina>(`/identidade/usuarios?${query}`)

export const buscarUsuario = (id: string) => apiAutenticada<Perfil>(`/identidade/usuarios/${encodeURIComponent(id)}`)

export interface DadosUsuario {
  nome: string
  email: string
  cpf: string
  telefone: string
}

export const atualizarUsuario = (id: number, dados: Partial<DadosUsuario>) =>
  apiAutenticada<Perfil>(`/identidade/usuarios/${id}`, { method: 'PATCH', json: dados })

export const alterarStatusUsuario = (id: number, ativo: boolean) =>
  apiAutenticada<Perfil>(`/identidade/usuarios/${id}/status`, { method: 'PATCH', json: { ativo } })

export const definirCargos = (id: number, cargos: string[]) =>
  apiAutenticada<Perfil>(`/identidade/usuarios/${id}/cargos`, { method: 'PUT', json: { cargos } })

export const listarCargos = () => apiAutenticada<Cargo[]>('/identidade/cargos')

export interface ClientePedido {
  id_usuario: number | null
  nome: string
  email: string
  telefone: string | null
}

export type PedidoAdmin = PedidoResumo & { cliente: ClientePedido | null }
export type PedidoCompletoAdmin = Pedido & { cliente: ClientePedido | null }

export interface PedidosAdminPagina {
  dados: PedidoAdmin[]
  pagina: number
  limite: number
  total: number
}

export const listarTodosPedidos = (query: string) =>
  apiAutenticada<PedidosAdminPagina>(`/vendas/pedidos?todos=true&${query}`).then((p) => ({
    ...p,
    dados: p.dados.map((d) => ({ ...d, valor_total: Number(d.valor_total), valor_frete: Number(d.valor_frete) })),
  }))

export const buscarPedidoAdmin = (id: string) =>
  apiAutenticada<PedidoCompletoAdmin>(`/vendas/pedidos/${encodeURIComponent(id)}`).then((p) => ({
    ...p,
    valor_total: Number(p.valor_total),
    valor_frete: Number(p.valor_frete),
    itens: (p.itens ?? []).map((i) => ({ ...i, preco_unitario: Number(i.preco_unitario) })),
  }))

export const atualizarStatusPedido = (id: number, status: StatusPedido) =>
  apiAutenticada<PedidoCompletoAdmin>(`/vendas/pedidos/${id}/status`, { method: 'PATCH', json: { status } })

export const PROXIMO_STATUS: Partial<Record<StatusPedido, { status: StatusPedido; rotulo: string; pergunta: string }>> = {
  PAGO: { status: 'ENVIADO', rotulo: 'Marcar como enviado', pergunta: 'Marcar como enviado?' },
  ENVIADO: { status: 'ENTREGUE', rotulo: 'Marcar como entregue', pergunta: 'Marcar como entregue?' },
}

export const PODE_CANCELAR: StatusPedido[] = ['AGUARDANDO_PAGAMENTO', 'PAGO']

export interface ResumoDeVendas {
  total_pedidos: number
  pedidos_por_status: Record<StatusPedido, number>
  pedidos_ultimas_24h: number
  receita_total: number
  receita_por_dia: { dia: string; receita: number; pedidos: number }[]
}

export interface ProdutoMaisVendido {
  id_produto: number | null
  nome_produto: string
  quantidade_vendida: number
  receita: number
}

export const resumoDeVendas = (dias: number) =>
  apiAutenticada<ResumoDeVendas>(`/vendas/pedidos/resumo?dias=${dias}`).then((r) => ({
    ...r,
    receita_total: Number(r.receita_total),
    receita_por_dia: r.receita_por_dia.map((d) => ({ ...d, receita: Number(d.receita) })),
  }))

export const maisVendidos = (limite: number) =>
  apiAutenticada<ProdutoMaisVendido[]>(`/vendas/pedidos/mais-vendidos?limite=${limite}`).then((l) =>
    l.map((p) => ({ ...p, receita: Number(p.receita) })),
  )
