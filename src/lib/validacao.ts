import { soDigitos } from './mascaras'

export function cpfValido(valor: string): boolean {
  const cpf = soDigitos(valor)
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

  const digito = (qtd: number) => {
    let soma = 0
    for (let i = 0; i < qtd; i++) soma += Number(cpf[i]) * (qtd + 1 - i)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }

  return digito(9) === Number(cpf[9]) && digito(10) === Number(cpf[10])
}

export const telefoneValido = (valor: string) => [10, 11].includes(soDigitos(valor).length)

export const emailValido = (valor: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim())

export const SENHA_MIN = 6
export const SENHA_MAX = 72
