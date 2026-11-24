import { useState } from 'react'

interface Props {
  rotulo: string
  pergunta: string
  confirmarRotulo?: string
  aoConfirmar: () => Promise<unknown> | void
  tom?: 'perigo' | 'neutro'
}

export function BotaoConfirmar({ rotulo, pergunta, confirmarRotulo = 'Sim', aoConfirmar, tom = 'perigo' }: Props) {
  const [aberto, setAberto] = useState(false)
  const [executando, setExecutando] = useState(false)

  const executar = async () => {
    setExecutando(true)
    try {
      await aoConfirmar()
    } finally {
      setExecutando(false)
      setAberto(false)
    }
  }

  if (!aberto) {
    const cor = tom === 'perigo' ? 'text-red-600 hover:border-red-300 hover:bg-red-50' : 'text-slate-700 hover:border-brand-600 hover:text-brand-600'
    return (
      <button type="button" onClick={() => setAberto(true)} className={`rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${cor}`}>
        {rotulo}
      </button>
    )
  }

  return (
    <span role="group" aria-label={pergunta} className="inline-flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs">
      <span className="font-semibold">{pergunta}</span>
      <button type="button" disabled={executando} onClick={executar} className="rounded-md bg-red-600 px-2.5 py-1 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60">
        {executando ? '...' : confirmarRotulo}
      </button>
      <button type="button" disabled={executando} onClick={() => setAberto(false)} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-semibold transition hover:border-brand-600 disabled:opacity-60">
        Não
      </button>
    </span>
  )
}
