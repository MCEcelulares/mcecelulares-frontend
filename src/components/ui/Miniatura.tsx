import { ImageOff } from 'lucide-react'
import { urlImagem } from '../../lib/api'

const TAMANHOS = {
  sm: { caixa: 'h-14 w-14 rounded-lg', imagem: 'p-1', icone: 20 },
  md: { caixa: 'h-16 w-16 rounded-lg', imagem: 'p-1', icone: 22 },
  lg: { caixa: 'h-20 w-20 rounded-xl', imagem: 'p-2', icone: 24 },
  xl: { caixa: 'h-24 w-24 rounded-xl', imagem: 'p-2', icone: 28 },
}

export function Miniatura({ imagem, tamanho }: { imagem: string | null | undefined; tamanho: keyof typeof TAMANHOS }) {
  const t = TAMANHOS[tamanho]
  const url = urlImagem(imagem)
  return (
    <span className={`relative block shrink-0 overflow-hidden border border-slate-100 bg-white ${t.caixa}`}>
      {url ? (
        <img src={url} alt="" className={`absolute inset-0 h-full w-full object-contain ${t.imagem}`} />
      ) : (
        <ImageOff size={t.icone} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" />
      )}
    </span>
  )
}
