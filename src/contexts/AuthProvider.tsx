import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as auth from '../lib/auth'
import { AuthContext, type AuthContextValue } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<auth.Perfil | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let ativo = true
    auth
      .renovar()
      .then((perfil) => ativo && setUsuario(perfil))
      .finally(() => ativo && setCarregando(false))
    return () => {
      ativo = false
    }
  }, [])

  const entrar = useCallback<AuthContextValue['entrar']>(async (email, senha, manter) => {
    setUsuario(await auth.entrar(email, senha, manter))
  }, [])

  const cadastrar = useCallback<AuthContextValue['cadastrar']>(async (dados) => {
    setUsuario(await auth.cadastrar(dados))
  }, [])

  const sair = useCallback(async () => {
    setUsuario(null)
    await auth.sair()
  }, [])

  const atualizarPerfil = useCallback<AuthContextValue['atualizarPerfil']>(async (dados) => {
    setUsuario(await auth.atualizarPerfil(dados))
  }, [])

  const alterarSenha = useCallback<AuthContextValue['alterarSenha']>(
    async (senhaAtual, novaSenha) => {
      if (!usuario) return
      const persistente = auth.sessaoPersistente()
      await auth.alterarSenha(senhaAtual, novaSenha)
      setUsuario(await auth.entrar(usuario.email, novaSenha, persistente))
    },
    [usuario],
  )

  const valor = useMemo(
    () => ({ usuario, carregando, entrar, cadastrar, sair, atualizarPerfil, alterarSenha }),
    [usuario, carregando, entrar, cadastrar, sair, atualizarPerfil, alterarSenha],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
