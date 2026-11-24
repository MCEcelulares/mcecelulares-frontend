import { apiAutenticada } from './auth'
import { soDigitos } from './mascaras'

export interface Endereco {
  id_endereco: number
  id_usuario: number
  endereco: string
  numero: string
  complemento: string | null
  bairro: string | null
  cidade: string
  estado: string
  cep: string
  principal: boolean
}

interface NovoEndereco {
  endereco: string
  numero: string
  complemento?: string
  bairro?: string
  cidade: string
  estado: string
  cep: string
}

export const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const

export const listarEnderecos = (idUsuario: number) =>
  apiAutenticada<Endereco[]>(`/identidade/usuarios/${idUsuario}/enderecos`)

export const criarEndereco = (idUsuario: number, dados: NovoEndereco) =>
  apiAutenticada<Endereco>(`/identidade/usuarios/${idUsuario}/enderecos`, { method: 'POST', json: dados })

export const atualizarEndereco = (idUsuario: number, idEndereco: number, dados: Partial<NovoEndereco>) =>
  apiAutenticada<Endereco>(`/identidade/usuarios/${idUsuario}/enderecos/${idEndereco}`, { method: 'PATCH', json: dados })

export const removerEndereco = (idUsuario: number, idEndereco: number) =>
  apiAutenticada<void>(`/identidade/usuarios/${idUsuario}/enderecos/${idEndereco}`, { method: 'DELETE' })

export const marcarEnderecoPrincipal = (idUsuario: number, idEndereco: number) =>
  apiAutenticada<Endereco>(`/identidade/usuarios/${idUsuario}/enderecos/${idEndereco}/principal`, { method: 'PATCH' })

export const formatarCep = (cep: string) => {
  const d = soDigitos(cep)
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : cep
}

type EnderecoTexto = Pick<Endereco, 'endereco' | 'numero' | 'complemento' | 'bairro' | 'cidade' | 'estado'>

export const linhaRua = (e: EnderecoTexto) => `${e.endereco}, ${e.numero}${e.complemento ? ` - ${e.complemento}` : ''}`

export const linhaCidade = (e: EnderecoTexto) => `${e.bairro ? `${e.bairro} · ` : ''}${e.cidade} - ${e.estado}`
