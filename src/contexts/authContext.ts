import { createContext } from 'react'
import type { DadosCadastro, DadosPerfil, Perfil } from '../lib/auth'

export interface AuthContextValue {
  usuario: Perfil | null
  /** true enquanto a sessão guardada ainda está sendo restaurada ao abrir o site. */
  carregando: boolean
  entrar: (email: string, senha: string, manterConectado: boolean) => Promise<void>
  cadastrar: (dados: DadosCadastro) => Promise<void>
  sair: () => Promise<void>
  atualizarPerfil: (dados: Partial<DadosPerfil>) => Promise<void>
  /** Troca a senha e já abre uma nova sessão com ela (o servidor encerra as anteriores). */
  alterarSenha: (senhaAtual: string, novaSenha: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
