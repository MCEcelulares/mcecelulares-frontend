import { ServerCrash } from 'lucide-react'
import { CategoriasGrid } from '../components/home/CategoriasGrid'
import { Hero } from '../components/home/Hero'
import { MarcasStrip } from '../components/home/MarcasStrip'
import { SecaoProdutos } from '../components/produto/SecaoProdutos'
import { classeBotao } from '../components/ui/botao'
import { EstadoVazio } from '../components/ui/EstadoVazio'
import { useConsulta } from '../hooks/useConsulta'
import { listarDestaques, listarRecentes } from '../lib/catalogo'

export default function Home() {
  const destaques = useConsulta(listarDestaques)
  const recentes = useConsulta(listarRecentes)

  // Sem os produtos a Home ficaria em branco: avisa e deixa tentar de novo.
  if (destaques.erro && recentes.erro) {
    return (
      <EstadoVazio
        moldura={false}
        nivel={1}
        role="alert"
        icone={ServerCrash}
        titulo="Não foi possível carregar a loja agora"
        descricao="Verifique sua conexão e tente novamente em instantes."
      >
        <button onClick={() => window.location.reload()} className={classeBotao()}>Tentar novamente</button>
      </EstadoVazio>
    )
  }

  return (
    <>
      {destaques.dados && destaques.dados.length > 0 && <Hero produtos={destaques.dados} />}
      <CategoriasGrid />
      <SecaoProdutos titulo="Ofertas em Destaque" produtos={destaques.dados} carregando={destaques.carregando} />
      <SecaoProdutos titulo="Lançamentos" produtos={recentes.dados} carregando={recentes.carregando} />
      <MarcasStrip />
    </>
  )
}
