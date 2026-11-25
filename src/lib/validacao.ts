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

const FORMATO_EMAIL = /^(?!\.)(?!.*\.\.)[a-z0-9._%+-]+(?<!\.)@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i

export const emailValido = (valor: string) => valor.trim().length <= 254 && FORMATO_EMAIL.test(valor.trim())

export const SENHA_MIN = 8
export const SENHA_MAX = 72

export const DICA_SENHA = `Use de ${SENHA_MIN} a ${SENHA_MAX} caracteres, com letra maiúscula, minúscula e número.`

export function erroDeSenha(senha: string): string | null {
  if (senha.length < SENHA_MIN) return `Use pelo menos ${SENHA_MIN} caracteres.`
  if (senha.length > SENHA_MAX) return `Use no máximo ${SENHA_MAX} caracteres.`
  if (!/[a-z]/.test(senha)) return 'Inclua ao menos uma letra minúscula.'
  if (!/[A-Z]/.test(senha)) return 'Inclua ao menos uma letra maiúscula.'
  if (!/\d/.test(senha)) return 'Inclua ao menos um número.'
  return null
}
