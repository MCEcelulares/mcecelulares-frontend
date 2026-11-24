import { api } from './api'

export interface Categoria {
  id_categoria: number
  nome: string
  icone: string | null
  ativo: boolean
}

export interface Marca {
  id_marca: number
  nome: string
  ativo: boolean
}

export interface Produto {
  id_produto: number
  nome: string
  descricao: string | null
  preco: number
  estoque: number
  imagem: string | null
  destaque: boolean
  ativo: boolean
  peso?: number | null
  altura?: number | null
  largura?: number | null
  comprimento?: number | null
  id_marca: number
  id_categoria: number
  criado_em: string
  marca?: { id_marca: number; nome: string }
  categoria?: { id_categoria: number; nome: string }
}

export interface InfoPagina {
  pagina: number
  limite: number
  total: number
  totalPaginas: number
}

export interface ProdutosPagina {
  dados: Produto[]
  paginacao: InfoPagina
}

/** `query` é uma query string já montada (categoria, marca, precoMin, precoMax, busca, disponivel, ordenar, pagina, limite). */
export const listarProdutos = (query: string) => api<ProdutosPagina>(`/catalogo/produtos?${query}`)

export const buscarProduto = (id: string) => api<Produto>(`/catalogo/produtos/${encodeURIComponent(id)}`)

// Categorias quase não mudam: uma busca só por sessão, compartilhada por todos os componentes (refaz se falhar).
let categorias: Promise<Categoria[]> | null = null
export const listarCategorias = () =>
  (categorias ??= api<Categoria[]>('/catalogo/categorias').catch((e: unknown) => {
    categorias = null
    throw e
  }))
/** O painel mexe nas categorias: esquece a lista guardada para a loja buscar de novo. */
export const esquecerCategorias = () => {
  categorias = null
}
export const listarMarcas = () => api<Marca[]>('/catalogo/marcas')
export const listarDestaques = () => api<Produto[]>('/catalogo/produtos/destaque?limite=8')
export const listarRecentes = () => api<Produto[]>('/catalogo/produtos/recentes?limite=8')
