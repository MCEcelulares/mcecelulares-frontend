import { useEffect, useState } from 'react'

type Desfecho<T> = { dados: T | null; erro: Error | null }
type Resultado<T, A> = Desfecho<T> & { buscar: (arg: A) => Promise<T>; arg: A | undefined }

const consultar = <T, A>(buscar: (arg: A) => Promise<T>, arg: A): Promise<Desfecho<T>> =>
  buscar(arg).then(
    (dados) => ({ dados, erro: null }),
    (e: unknown) => ({ dados: null, erro: e instanceof Error ? e : new Error(String(e)) }),
  )

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
