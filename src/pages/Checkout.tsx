import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { MapPin, Plus } from 'lucide-react'
import { AlertaErro } from '../components/auth/AuthShell'
import { FormEndereco } from '../components/checkout/FormEndereco'
import { ResumoItens } from '../components/checkout/ResumoItens'
import { classeBotao } from '../components/ui/botao'
import { Carregando } from '../components/ui/Carregando'
import { useAuth } from '../hooks/useAuth'
import { useCarrinho } from '../hooks/useCarrinho'
import { useProdutosPorId } from '../hooks/useProdutosPorId'
import { mensagemDe } from '../lib/api'
import { formatarCep, linhaCidade, linhaRua, listarEnderecos, type Endereco } from '../lib/enderecos'
import { criarPedido } from '../lib/pedidos'

function CartaoEndereco({ endereco, selecionado, onSelecionar }: { endereco: Endereco; selecionado: boolean; onSelecionar: () => void }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-4 rounded-2xl border-2 bg-white p-5 transition ${
        selecionado ? 'border-brand-600 shadow-md shadow-brand-600/10' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <input type="radio" name="endereco" checked={selecionado} onChange={onSelecionar} className="mt-1 h-5 w-5 accent-brand-600" />
      <span className="min-w-0 flex-1 text-sm">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{linhaRua(endereco)}</span>
          {endereco.principal && <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-bold tracking-wide text-brand-600 uppercase">Principal</span>}
        </span>
        <span className="mt-1 block text-slate-600">{linhaCidade(endereco)}</span>
        <span className="block text-slate-500">CEP {formatarCep(endereco.cep)}</span>
      </span>
    </label>
  )
}

export default function Checkout() {
  const { usuario } = useAuth()
  const { carrinho, carregando: carregandoCarrinho, recarregar } = useCarrinho()
  const navigate = useNavigate()
  const idUsuario = usuario!.id_usuario // a rota é protegida

  const [enderecos, setEnderecos] = useState<Endereco[] | null>(null)
  const [erroEnderecos, setErroEnderecos] = useState(false)
  const [escolhido, setEscolhido] = useState<number | null>(null)
  const [cadastrando, setCadastrando] = useState(false)
  const [criando, setCriando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const produtos = useProdutosPorId(carrinho?.itens.map((i) => i.id_produto) ?? [])

  useEffect(() => {
    let ativo = true
    listarEnderecos(idUsuario)
      .then((lista) => {
        if (!ativo) return
        setEnderecos(lista)
        setEscolhido((atual) => atual ?? lista.find((e) => e.principal)?.id_endereco ?? lista[0]?.id_endereco ?? null)
      })
      .catch(() => ativo && setErroEnderecos(true))
    return () => {
      ativo = false
    }
  }, [idUsuario])

  if (carregandoCarrinho || (enderecos === null && !erroEnderecos)) {
    return <Carregando />
  }

  if (!carrinho || carrinho.itens.length === 0) return <Navigate to="/carrinho" replace />

  const lista = enderecos ?? []
  const mostrarForm = !erroEnderecos && (cadastrando || lista.length === 0)

  const aoSalvar = (novo: Endereco) => {
    setEnderecos((atual) => [...(atual ?? []), novo])
    setEscolhido(novo.id_endereco)
    setCadastrando(false)
  }

  const irParaPagamento = async () => {
    if (escolhido === null) return
    setErro(null)
    setCriando(true)
    try {
      const pedido = await criarPedido(escolhido)
      navigate(`/checkout/pagamento/${pedido.id_pedido}`, { replace: true })
      recarregar().catch(() => undefined) // criar o pedido encerra o carrinho; se falhar, o carrinho atualiza na próxima visita
    } catch (e) {
      setErro(mensagemDe(e, 'Não foi possível criar o pedido. Tente novamente.'))
      setCriando(false)
    }
  }

  const resumo = carrinho.itens.map((i) => {
    const p = produtos.get(i.id_produto)
    return { chave: i.id_item_carrinho, nome: p?.nome ?? 'Produto', quantidade: i.quantidade, precoUnitario: i.preco_unitario, imagem: p?.imagem }
  })

  return (
    <div className="pagina py-10">
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <h1 className="titulo-pagina">Escolha o Endereço de Entrega</h1>

          {erroEnderecos && <AlertaErro mensagem="Não foi possível carregar seus endereços. Recarregue a página." />}

          {lista.length > 0 && (
            <div className="space-y-4" role="radiogroup" aria-label="Endereços de entrega">
              {lista.map((e) => (
                <CartaoEndereco key={e.id_endereco} endereco={e} selecionado={escolhido === e.id_endereco} onSelecionar={() => setEscolhido(e.id_endereco)} />
              ))}
            </div>
          )}

          <section className="cartao p-6 md:p-8">
            {mostrarForm ? (
              <>
                <h2 className="mb-6 flex items-center gap-2 titulo-secao">
                  <MapPin size={20} className="text-brand-600" /> Cadastrar Novo Endereço
                </h2>
                <FormEndereco idUsuario={idUsuario} onSalvo={aoSalvar} onCancelar={lista.length > 0 ? () => setCadastrando(false) : undefined} />
              </>
            ) : (
              <button onClick={() => setCadastrando(true)} className="flex items-center gap-2 font-semibold text-brand-600 hover:underline">
                <Plus size={18} /> Cadastrar novo endereço
              </button>
            )}
          </section>
        </div>

        <ResumoItens
          itens={resumo}
          subtotal={carrinho.total}
          total={carrinho.total}
          acao={
            <div className="space-y-3">
              {erro && <AlertaErro mensagem={erro} />}
              <button
                onClick={irParaPagamento}
                disabled={escolhido === null || criando}
                className={classeBotao('primario', 'formulario')}
              >
                {criando ? 'Criando pedido...' : 'Ir para Pagamento'}
              </button>
              {escolhido === null && !erroEnderecos && <p className="text-center text-xs text-slate-500">Cadastre ou selecione um endereço para continuar.</p>}
            </div>
          }
        />
      </div>
    </div>
  )
}
