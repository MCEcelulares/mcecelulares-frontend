/** Calculado uma vez ao carregar o site (e não a cada renderização). */
export const ANO_ATUAL = new Date().getFullYear()

export const EMPRESA = {
  nome: 'MCE Celulares',
  telefone: '(45) 99945-7149',
  // Provisório: o e-mail de suporte ainda não existe. Trocar aqui quando for criado.
  emailSuporte: 'suporte@mcecelulares.com.br',
  whatsappUrl: 'https://wa.me/554599457149',
  instagramUrl: 'https://www.instagram.com/mcecelulares',
  mapsUrl: 'https://maps.app.goo.gl/noykfqR7HGqMM55DA',
  endereco: 'Rua Minas Gerais, 37',
  cidade: 'Centro, Corbélia - PR',
  cep: '85420-000',
} as const
