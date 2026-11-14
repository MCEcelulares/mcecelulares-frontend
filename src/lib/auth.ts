import { api, ApiError, type ApiInit } from './api'

export interface Perfil {
  id_usuario: number
  nome: string
  email: string
  cpf: string | null
  telefone: string | null
  ativo: boolean
  admin: boolean
  email_verificado: boolean
  cargos: string[]
  permissoes: string[]
}

interface Sessao {
  token: string
  expiraEm: number // segundos
  refreshToken: string | null
  usuario: Perfil
}

export interface DadosCadastro {
  nome: string
  email: string
  senha: string
  cpf: string
  telefone: string
}

const CHAVE_REFRESH = 'mce.refreshToken'
const MARGEM_MS = 10_000

// Access token só em memória; refresh token no storage (local = "manter conectado", session = só esta aba).
let tokenAcesso: string | null = null
let expiraEmMs = 0
let emRenovacao: Promise<Perfil | null> | null = null

const lerRefresh = () => localStorage.getItem(CHAVE_REFRESH) ?? sessionStorage.getItem(CHAVE_REFRESH)

function guardarRefresh(token: string | null, persistente: boolean) {
  localStorage.removeItem(CHAVE_REFRESH)
  sessionStorage.removeItem(CHAVE_REFRESH)
  if (token) (persistente ? localStorage : sessionStorage).setItem(CHAVE_REFRESH, token)
}

function limparSessao() {
  tokenAcesso = null
  expiraEmMs = 0
  guardarRefresh(null, false)
}

function aplicarSessao(sessao: Sessao, persistente: boolean): Perfil {
  tokenAcesso = sessao.token
  expiraEmMs = Date.now() + sessao.expiraEm * 1000
  guardarRefresh(sessao.refreshToken, persistente)
  return sessao.usuario
}

export async function entrar(email: string, senha: string, manterConectado: boolean): Promise<Perfil> {
  const sessao = await api<Sessao>('/identidade/auth/login', { method: 'POST', json: { email, senha } })
  return aplicarSessao(sessao, manterConectado)
}

export async function cadastrar(dados: DadosCadastro): Promise<Perfil> {
  await api('/identidade/usuarios', { method: 'POST', json: dados })
  return entrar(dados.email, dados.senha, true)
}

/** Indica se a sessão atual foi aberta com "Manter conectado" (refresh token no localStorage). */
export const sessaoPersistente = () => localStorage.getItem(CHAVE_REFRESH) !== null

export interface DadosPerfil {
  nome: string
  cpf: string
  telefone: string
}

export const atualizarPerfil = (dados: Partial<DadosPerfil>) =>
  apiAutenticada<Perfil>('/identidade/usuarios/me', { method: 'PATCH', json: dados })

/** Trocar a senha encerra todas as sessões do usuário no servidor; quem chama deve entrar de novo. */
export const alterarSenha = (senhaAtual: string, novaSenha: string) =>
  apiAutenticada<void>('/identidade/usuarios/me/senha', { method: 'PATCH', json: { senhaAtual, novaSenha } })

/**
 * Renova a sessão com o refresh token guardado. O refresh token é de uso único, então chamadas
 * simultâneas compartilham a mesma requisição (senão a segunda invalidaria a primeira).
 */
export function renovar(): Promise<Perfil | null> {
  if (emRenovacao) return emRenovacao

  const refreshToken = lerRefresh()
  if (!refreshToken) return Promise.resolve(null)
  const persistente = localStorage.getItem(CHAVE_REFRESH) !== null

  emRenovacao = api<Sessao>('/identidade/auth/refresh', { method: 'POST', json: { refreshToken } })
    .then((sessao) => aplicarSessao(sessao, persistente))
    .catch((e: unknown) => {
      // Token recusado: sessão inválida. Falha de rede/5xx: mantém o token para uma próxima tentativa.
      if (e instanceof ApiError && (e.status === 400 || e.status === 401)) limparSessao()
      return null
    })
    .finally(() => {
      emRenovacao = null
    })

  return emRenovacao
}

export async function sair(): Promise<void> {
  const refreshToken = lerRefresh()
  limparSessao()
  if (refreshToken) {
    await api('/identidade/auth/logout', { method: 'POST', json: { refreshToken } }).catch(() => undefined)
  }
}

/** Chamada autenticada: renova o token se estiver perto de expirar e tenta de novo uma vez em caso de 401. */
export async function apiAutenticada<T>(path: string, init: ApiInit = {}): Promise<T> {
  if (!tokenAcesso || Date.now() > expiraEmMs - MARGEM_MS) await renovar()
  if (!tokenAcesso) throw new ApiError('Sessão expirada. Entre novamente.', 401)

  try {
    return await api<T>(path, { ...init, token: tokenAcesso })
  } catch (e) {
    if (e instanceof ApiError && e.status === 401 && (await renovar()) && tokenAcesso) {
      return api<T>(path, { ...init, token: tokenAcesso })
    }
    throw e
  }
}
