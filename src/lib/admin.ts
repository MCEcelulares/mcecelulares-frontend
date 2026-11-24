import { apiAutenticada } from './auth'
import type { Categoria, Marca, Produto, ProdutosPagina } from './catalogo'

// Chamadas do painel administrativo. Todas exigem login; o back-end confere a permissão de cada rota.

/** Normaliza decimais que o back-end pode devolver como texto. */
const normalizarProduto = (p: Produto): Produto => ({ ...p, preco: Number(p.preco) })

// ---- Produtos (catálogo)

/** `query`: busca, categoria, marca, incluirInativos, pagina, limite... (inclui os inativos quando `incluirInativos=true`). */
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

// ---- Categorias e marcas (com as inativas, para o painel)

export const listarCategoriasAdmin = () => apiAutenticada<Categoria[]>('/catalogo/categorias?incluirInativos=true')
export const listarMarcasAdmin = () => apiAutenticada<Marca[]>('/catalogo/marcas?incluirInativos=true')

export interface DadosSimples {
  nome: string
  ativo: boolean
}

export const criarCategoria = (dados: DadosSimples) => apiAutenticada<Categoria>('/catalogo/categorias', { method: 'POST', json: dados })
export const atualizarCategoria = (id: number, dados: Partial<DadosSimples>) =>
  apiAutenticada<Categoria>(`/catalogo/categorias/${id}`, { method: 'PATCH', json: dados })
/** 409 quando ainda há produtos ligados à categoria. */
export const excluirCategoria = (id: number) => apiAutenticada<void>(`/catalogo/categorias/${id}`, { method: 'DELETE' })

export const criarMarca = (dados: DadosSimples) => apiAutenticada<Marca>('/catalogo/marcas', { method: 'POST', json: dados })
export const atualizarMarca = (id: number, dados: Partial<DadosSimples>) =>
  apiAutenticada<Marca>(`/catalogo/marcas/${id}`, { method: 'PATCH', json: dados })
/** 409 quando ainda há produtos ligados à marca. */
export const excluirMarca = (id: number) => apiAutenticada<void>(`/catalogo/marcas/${id}`, { method: 'DELETE' })

// ---- Estoque e imagem de um produto

/** `ajuste` positivo soma e negativo subtrai. 409 quando o estoque ficaria negativo. */
export const ajustarEstoque = (id: number, ajuste: number) =>
  apiAutenticada<Produto>(`/catalogo/produtos/${id}/estoque`, { method: 'PATCH', json: { ajuste } }).then(normalizarProduto)

/** JPEG, PNG ou WEBP de até 2 MB; o back-end confere o tipo pelos bytes do arquivo. */
export const enviarImagem = (id: number, arquivo: File) => {
  const corpo = new FormData()
  corpo.append('imagem', arquivo)
  return apiAutenticada<{ id_produto: number; imagem: string }>(`/catalogo/produtos/${id}/imagem`, { method: 'POST', formData: corpo })
}

export const removerImagem = (id: number) => apiAutenticada<void>(`/catalogo/produtos/${id}/imagem`, { method: 'DELETE' })
