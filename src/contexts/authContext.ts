import { createContext } from 'react'
import type { DadosCadastro, DadosPerfil, Perfil } from '../lib/auth'

export interface AuthContextValue {
  usuario: Perfil | null
  carregando: boolean
  entrar: (email: string, senha: string, manterConectado: boolean) => Promise<void>
  cadastrar: (dados: DadosCadastro) => Promise<void>
  sair: () => Promise<void>
  atualizarPerfil: (dados: Partial<DadosPerfil>) => Promise<void>
  alterarSenha: (senhaAtual: string, novaSenha: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
