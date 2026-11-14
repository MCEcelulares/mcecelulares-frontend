export const soDigitos = (valor: string) => valor.replace(/\D/g, '')

export function mascararCpf(valor: string): string {
  const d = soDigitos(valor).slice(0, 11)
  let saida = d.slice(0, 3)
  if (d.length > 3) saida += `.${d.slice(3, 6)}`
  if (d.length > 6) saida += `.${d.slice(6, 9)}`
  if (d.length > 9) saida += `-${d.slice(9, 11)}`
  return saida
}

export function mascararCep(valor: string): string {
  const d = soDigitos(valor).slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

export function mascararTelefone(valor: string): string {
  const d = soDigitos(valor).slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
