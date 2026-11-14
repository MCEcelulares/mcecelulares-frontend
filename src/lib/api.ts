const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  /** Detalhes de validação do back (zod `flatten()`): `{ fieldErrors: { campo: ['mensagem'] } }`. */
  detalhes?: { fieldErrors?: Record<string, string[] | undefined> }

  constructor(message: string, status: number, detalhes?: ApiError['detalhes']) {
    super(message)
    this.status = status
    this.detalhes = detalhes
  }
}

/** Código HTTP de um erro da API; 0 se a requisição nem chegou ao servidor ou se o erro não for da API. */
export const statusDe = (e: unknown) => (e instanceof ApiError ? e.status : 0)

export interface ApiInit extends Omit<RequestInit, 'body'> {
  /** Corpo JSON (serializado automaticamente). */
  json?: unknown
  /** Access token JWT; vira o header Authorization. */
  token?: string | null
}

export async function api<T>(path: string, { json, token, ...init }: ApiInit = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json', ...(init.headers as Record<string, string>) }
  if (json !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers, body: json !== undefined ? JSON.stringify(json) : undefined })
  } catch {
    // fetch só lança quando não chega ao servidor (offline, servidor fora do ar, CORS); status 0 = sem resposta
    throw new ApiError('Sem conexão com o servidor. Verifique sua internet e tente novamente.', 0)
  }

  if (!res.ok) {
    const corpo = await res.json().catch(() => null)
    throw new ApiError(corpo?.erro ?? 'Erro ao comunicar com o servidor', res.status, corpo?.detalhes)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

/** Converte o caminho de imagem devolvido pela API (ex.: /catalogo/imagens/x.png) em URL completa. */
export function urlImagem(caminho: string | null | undefined): string | null {
  if (!caminho) return null
  return /^https?:\/\//.test(caminho) ? caminho : `${API_URL}${caminho}`
}
