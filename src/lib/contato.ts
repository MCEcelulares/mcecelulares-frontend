import { api } from './api'

interface DadosContato {
  nome: string
  email: string
  assunto?: string
  telefone?: string
  mensagem: string
}

export const MENSAGEM_MAX = 2000
export const ASSUNTO_MAX = 150

export const enviarContato = (dados: DadosContato) =>
  api<{ mensagem: string }>('/notificacao/contato', { method: 'POST', json: dados })
