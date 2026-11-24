import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, PackageSearch } from 'lucide-react'
import { Aviso } from '../../components/ui/Aviso'
import { classeBotao } from '../../components/ui/botao'
import { Campo, CampoSelect, CampoTexto } from '../../components/ui/Campo'
import { Carregando } from '../../components/ui/Carregando'
import { EstadoVazio } from '../../components/ui/EstadoVazio'
import { useConsulta } from '../../hooks/useConsulta'
import { type Erros, useFormulario } from '../../hooks/useFormulario'
import { atualizarProduto, buscarProdutoAdmin, criarProduto, listarCategoriasAdmin, listarMarcasAdmin } from '../../lib/admin'
import { statusDe } from '../../lib/api'
import type { Produto } from '../../lib/catalogo'

type Valores = {
  nome: string
  descricao: string
  preco: string
  estoque: string
  id_marca: string
  id_categoria: string
  ativo: string
  destaque: string
}

const paraNumero = (texto: string) => Number(texto.replace(',', '.'))

const inicial = (p: Produto | null): Valores => ({
  nome: p?.nome ?? '',
  descricao: p?.descricao ?? '',
  preco: p ? String(p.preco).replace('.', ',') : '',
  estoque: p ? String(p.estoque) : '0',
  id_marca: p ? String(p.id_marca) : '',
  id_categoria: p ? String(p.id_categoria) : '',
  ativo: p ? String(p.ativo) : 'true',
  destaque: p ? String(p.destaque) : 'false',
})

// O back-end só aceita estoque no cadastro; depois dele o estoque muda por ajuste (soma ou subtração), nunca por edição.
function validar(v: Valores, editando: boolean): Erros<Valores> {
  const erros: Erros<Valores> = {}
  if (!v.nome.trim()) erros.nome = 'Informe o nome do produto.'
  if (!/^\d+([.,]\d{1,2})?$/.test(v.preco.trim()) || paraNumero(v.preco) <= 0) erros.preco = 'Informe um preço maior que zero, com até 2 casas decimais.'
  if (!editando && !/^\d+$/.test(v.estoque.trim())) erros.estoque = 'Informe a quantidade em estoque (0 ou mais).'
  if (!v.id_marca) erros.id_marca = 'Escolha a marca.'
  if (!v.id_categoria) erros.id_categoria = 'Escolha a categoria.'
  return erros
}

function FormProduto({ produto }: { produto: Produto | null }) {
  const navigate = useNavigate()
  const [salvo, setSalvo] = useState(false)
  const categorias = useConsulta(listarCategoriasAdmin)
  const marcas = useConsulta(listarMarcasAdmin)

  const { valores, erros, erroGeral, enviando, alterar, enviar } = useFormulario<Valores>({
    inicial: () => inicial(produto),
    validar: (v) => validar(v, produto !== null),
    mensagemPadrao: 'Não foi possível salvar o produto. Tente novamente.',
    aoMudar: () => setSalvo(false),
    enviar: async (v) => {
      const dados = {
        nome: v.nome.trim(),
        descricao: v.descricao.trim() || null,
        preco: paraNumero(v.preco),
        id_marca: Number(v.id_marca),
        id_categoria: Number(v.id_categoria),
        ativo: v.ativo === 'true',
        destaque: v.destaque === 'true',
      }
      if (produto) {
        await atualizarProduto(produto.id_produto, dados)
        setSalvo(true)
      } else {
        const novo = await criarProduto({ ...dados, estoque: Number(v.estoque) })
        navigate(`/admin/produtos/${novo.id_produto}`, { replace: true })
      }
    },
  })

  const opcoes = categorias.carregando || marcas.carregando

  return (
    <div>
      <Link to="/admin/produtos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline"><ArrowLeft size={16} /> Produtos</Link>
      <h1 className="titulo-pagina mt-3">{produto ? `Editar produto #${produto.id_produto}` : 'Novo produto'}</h1>

      <form onSubmit={enviar} noValidate className="cartao mt-6 grid gap-5 p-6 sm:grid-cols-2">
        {erroGeral && <Aviso tom="erro" className="sm:col-span-2">{erroGeral}</Aviso>}
        {salvo && <Aviso tom="sucesso" className="sm:col-span-2">Produto salvo.</Aviso>}

        <Campo label="Nome" name="nome" value={valores.nome} onChange={(e) => alterar('nome', e.target.value)} erro={erros.nome} maxLength={255} className="sm:col-span-2" />
        <CampoTexto label="Descrição" name="descricao" value={valores.descricao} onChange={(e) => alterar('descricao', e.target.value)} erro={erros.descricao} rows={4} maxLength={5000} className="sm:col-span-2" />
        <Campo label="Preço (R$)" name="preco" inputMode="decimal" value={valores.preco} onChange={(e) => alterar('preco', e.target.value)} erro={erros.preco} placeholder="0,00" />
        <Campo
          label={produto ? 'Estoque atual' : 'Estoque inicial'}
          name="estoque"
          inputMode="numeric"
          value={valores.estoque}
          onChange={(e) => alterar('estoque', e.target.value)}
          erro={erros.estoque}
          readOnly={produto !== null}
          dica={produto ? 'O estoque muda por ajuste (soma ou subtração), não por edição.' : undefined}
        />
        <CampoSelect label="Categoria" name="id_categoria" value={valores.id_categoria} onChange={(e) => alterar('id_categoria', e.target.value)} erro={erros.id_categoria} disabled={opcoes}>
          <option value="">Escolha...</option>
          {(categorias.dados ?? []).map((c) => <option key={c.id_categoria} value={c.id_categoria}>{c.nome}{c.ativo ? '' : ' (inativa)'}</option>)}
        </CampoSelect>
        <CampoSelect label="Marca" name="id_marca" value={valores.id_marca} onChange={(e) => alterar('id_marca', e.target.value)} erro={erros.id_marca} disabled={opcoes}>
          <option value="">Escolha...</option>
          {(marcas.dados ?? []).map((m) => <option key={m.id_marca} value={m.id_marca}>{m.nome}{m.ativo ? '' : ' (inativa)'}</option>)}
        </CampoSelect>

        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="ativo" checked={valores.ativo === 'true'} onChange={(e) => alterar('ativo', String(e.target.checked))} className="h-4 w-4 accent-brand-600" />
          Ativo (aparece na loja)
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" name="destaque" checked={valores.destaque === 'true'} onChange={(e) => alterar('destaque', String(e.target.checked))} className="h-4 w-4 accent-brand-600" />
          Destaque na página inicial
        </label>

        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button type="submit" disabled={enviando} className={classeBotao('primario', 'sm')}>{enviando ? 'Salvando...' : 'Salvar produto'}</button>
          <Link to="/admin/produtos" className={classeBotao('contorno', 'sm')}>Voltar</Link>
        </div>
      </form>
    </div>
  )
}

function EditarProduto({ id }: { id: string }) {
  const { dados, erro, carregando } = useConsulta(buscarProdutoAdmin, id)

  if (carregando) return <Carregando />
  if (erro || !dados) {
    const naoExiste = statusDe(erro) === 404 || statusDe(erro) === 400
    return (
      <EstadoVazio moldura={false} nivel={1} role="alert" icone={PackageSearch} titulo={naoExiste ? 'Produto não encontrado' : 'Não foi possível carregar o produto'} descricao={naoExiste ? 'Ele não existe ou o endereço está errado.' : erro?.message}>
        <Link to="/admin/produtos" className={classeBotao()}>Voltar aos produtos</Link>
      </EstadoVazio>
    )
  }
  return <FormProduto key={dados.id_produto} produto={dados} />
}

export default function AdminProdutoForm() {
  const { id } = useParams()
  return id ? <EditarProduto id={id} /> : <FormProduto produto={null} />
}
