const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatarPreco = (valor: number) => moeda.format(valor)

/** "14 de novembro de 2026" */
export const dataLonga = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

/** "14/11, 16:54" */
export const dataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
