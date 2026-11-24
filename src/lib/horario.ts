const FUSO = 'America/Sao_Paulo'

interface Faixa {
  rotulo: string
  dias: number[]
  horas: { abre: string; fecha: string } | null
}

export const HORARIOS: Faixa[] = [
  { rotulo: 'Segunda a sexta', dias: [1, 2, 3, 4, 5], horas: { abre: '08:00', fecha: '18:30' } },
  { rotulo: 'Sábado', dias: [6], horas: { abre: '08:00', fecha: '12:00' } },
  { rotulo: 'Domingo', dias: [0], horas: null },
]

const DIAS_CURTOS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
const emMinutos = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5))

export function situacaoAgora(agora = new Date()) {
  const partes = new Intl.DateTimeFormat('en-US', { timeZone: FUSO, weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(agora)
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? ''
  const dia = DIAS_CURTOS[valor('weekday')]
  const minutos = (Number(valor('hour')) % 24) * 60 + Number(valor('minute'))

  const faixa = HORARIOS.find((f) => f.dias.includes(dia))
  const aberto = !!faixa?.horas && minutos >= emMinutos(faixa.horas.abre) && minutos < emMinutos(faixa.horas.fecha)
  return { dia, aberto }
}
