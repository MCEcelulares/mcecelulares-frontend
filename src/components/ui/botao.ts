
const VARIANTES = {
  primario: 'bg-brand-600 text-white hover:bg-brand-700',
  contorno: 'border border-slate-200 bg-white hover:border-brand-600 hover:text-brand-600',
  contornoRoxo: 'border border-brand-600 bg-white text-brand-600 hover:bg-brand-600 hover:text-white',
}

const TAMANHOS = {
  md: 'rounded-xl px-6 py-3',
  sm: 'rounded-lg px-5 py-2.5 text-sm',
  grande: 'rounded-xl px-8 py-3.5',
  largo: 'w-full rounded-xl py-3',
  formulario: 'w-full rounded-xl py-3.5',
}

export const classeBotao = (variante: keyof typeof VARIANTES = 'primario', tamanho: keyof typeof TAMANHOS = 'md', extra = '') =>
  `${VARIANTES[variante]} ${TAMANHOS[tamanho]} font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${extra}`.trim()
