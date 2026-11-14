import { useState, type FormEvent } from 'react'
import { ApiError } from '../lib/api'

export type Erros<V> = Partial<Record<keyof V, string>>

interface Opcoes<V extends Record<string, string>> {
  inicial: V | (() => V)
  validar?: (valores: V) => Erros<V>
  enviar: (valores: V) => Promise<unknown>
  /** Mensagem para falhas que não vieram da API (rede, bug). */
  mensagemPadrao: string
  /** Texto do alerta geral para um ApiError sem erros por campo. Padrão: a mensagem da API. */
  mensagemErro?: (err: ApiError) => string
  /** Erros por campo além dos `fieldErrors` da API (ex.: 409 de CPF duplicado). */
  errosExtras?: (err: ApiError) => Erros<V>
  /** Mantém `enviando` ligado após o sucesso (quando a tela vai ser trocada/redirecionada). */
  manterEnviando?: boolean
  /** Chamado ao editar um campo ou reenviar (ex.: limpar mensagem de sucesso). */
  aoMudar?: () => void
}

/** Estado e fluxo comuns dos formulários: valores, validação, envio e mapeamento de erros da API. */
export function useFormulario<V extends Record<string, string>>(opcoes: Opcoes<V>) {
  const { validar, mensagemPadrao, mensagemErro, errosExtras, manterEnviando, aoMudar } = opcoes
  const [valores, setValores] = useState<V>(opcoes.inicial)
  const [erros, setErros] = useState<Erros<V>>({})
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const alterar = (campo: keyof V & string, valor: string) => {
    setValores((v) => ({ ...v, [campo]: valor }))
    setErros((e) => ({ ...e, [campo]: undefined }))
    aoMudar?.()
  }

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setErroGeral(null)
    aoMudar?.()

    const invalidos = validar?.(valores) ?? {}
    setErros(invalidos)
    if (Object.keys(invalidos).length > 0) return

    setEnviando(true)
    try {
      await opcoes.enviar(valores)
      if (!manterEnviando) setEnviando(false)
    } catch (err) {
      if (err instanceof ApiError) {
        const porCampo = err.detalhes?.fieldErrors ?? {}
        const doServidor: Erros<V> = {}
        for (const campo of Object.keys(valores) as (keyof V & string)[]) {
          const msg = porCampo[campo]?.[0]
          if (msg) doServidor[campo] = msg
        }
        Object.assign(doServidor, errosExtras?.(err))
        if (Object.keys(doServidor).length > 0) setErros(doServidor)
        else setErroGeral(mensagemErro?.(err) ?? err.message)
      } else {
        setErroGeral(mensagemPadrao)
      }
      setEnviando(false)
    }
  }

  return { valores, setValores, erros, erroGeral, enviando, alterar, enviar }
}
