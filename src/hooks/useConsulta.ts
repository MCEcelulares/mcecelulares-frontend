import { useEffect, useState } from 'react'

type Desfecho<T> = { dados: T | null; erro: Error | null }
type Resultado<T, A> = Desfecho<T> & { buscar: (arg: A) => Promise<T>; arg: A | undefined }

// Nunca rejeita: transforma sucesso e falha no mesmo formato.
const consultar = <T, A>(buscar: (arg: A) => Promise<T>, arg: A): Promise<Desfecho<T>> =>
  buscar(arg).then(
    (dados) => ({ dados, erro: null }),
    (e: unknown) => ({ dados: null, erro: e instanceof Error ? e : new Error(String(e)) }),
  )

/**
 * Busca dados e acompanha o estado: `useConsulta(listarMarcas)` ou `useConsulta(buscarProduto, id)`.
 * Busca de novo sempre que `buscar` ou `arg` mudam. `buscar` deve ser uma função de módulo (estável) e `arg`, um
 * valor simples (texto ou número). `carregando` é derivado: vale enquanto a resposta guardada não é da consulta atual.
 * `recarregar` busca de novo sem voltar ao estado de carregando (os dados atuais continuam na tela).
 */
export function useConsulta<T, A = undefined>(buscar: (arg: A) => Promise<T>, arg?: A) {
  const [resultado, setResultado] = useState<Resultado<T, A> | null>(null)

  useEffect(() => {
    let valida = true
    consultar(buscar, arg as A).then((r) => valida && setResultado({ buscar, arg, ...r }))
    return () => {
      valida = false
    }
  }, [buscar, arg])

  const atual = resultado?.buscar === buscar && resultado.arg === arg ? resultado : null
  return {
    dados: atual?.dados ?? null,
    erro: atual?.erro ?? null,
    carregando: atual === null,
    recarregar: () => consultar(buscar, arg as A).then((r) => setResultado({ buscar, arg, ...r })),
  }
}
