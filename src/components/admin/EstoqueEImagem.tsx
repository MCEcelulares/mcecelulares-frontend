import { useRef, useState, type FormEvent } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { Aviso } from '../ui/Aviso'
import { classeBotao } from '../ui/botao'
import { Campo } from '../ui/Campo'
import { Miniatura } from '../ui/Miniatura'
import { ajustarEstoque, enviarImagem, removerImagem } from '../../lib/admin'
import { mensagemDe } from '../../lib/api'
import type { Produto } from '../../lib/catalogo'
import { BotaoConfirmar } from './BotaoConfirmar'

interface Props {
  produto: Produto
  aoMudar: () => Promise<unknown>
}

export function AjusteDeEstoque({ produto, aoMudar }: Props) {
  const [ajuste, setAjuste] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const aplicar = async (e: FormEvent) => {
    e.preventDefault()
    setSucesso(null)
    const valor = ajuste.trim()
    if (!/^[+-]?\d+$/.test(valor) || Number(valor) === 0) return setErro('Informe um número inteiro diferente de zero (ex.: 10 ou -3).')
    setErro(null)
    setEnviando(true)
    try {
      const atualizado = await ajustarEstoque(produto.id_produto, Number(valor))
      await aoMudar()
      setAjuste('')
      setSucesso(`Estoque ajustado: agora são ${atualizado.estoque} unidades.`)
    } catch (err) {
      setErro(mensagemDe(err, 'Não foi possível ajustar o estoque. Tente novamente.'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="cartao p-6" aria-labelledby="titulo-estoque">
      <h2 id="titulo-estoque" className="titulo-card">Estoque</h2>
      <p className="mt-1 text-sm text-slate-600">Hoje: <strong>{produto.estoque}</strong> {produto.estoque === 1 ? 'unidade' : 'unidades'}.</p>
      <form onSubmit={aplicar} noValidate className="mt-4 space-y-4">
        <Campo label="Ajuste" name="ajuste" inputMode="numeric" value={ajuste} onChange={(e) => { setAjuste(e.target.value); setErro(null) }} erro={erro ?? undefined} dica="Positivo soma, negativo subtrai. O estoque não pode ficar negativo." placeholder="Ex.: 10 ou -3" />
        {sucesso && <Aviso tom="sucesso">{sucesso}</Aviso>}
        <button type="submit" disabled={enviando} className={classeBotao('primario', 'sm')}>{enviando ? 'Aplicando...' : 'Aplicar ajuste'}</button>
      </form>
    </section>
  )
}

const TIPOS = ['image/jpeg', 'image/png', 'image/webp']
const LIMITE_BYTES = 2 * 1024 * 1024

export function ImagemDoProduto({ produto, aoMudar }: Props) {
  const entrada = useRef<HTMLInputElement>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const escolher = async (arquivo: File | undefined) => {
    setSucesso(null)
    if (!arquivo) return
    if (!TIPOS.includes(arquivo.type)) return setErro('Use uma imagem JPEG, PNG ou WEBP.')
    if (arquivo.size > LIMITE_BYTES) return setErro('A imagem deve ter até 2 MB.')
    setErro(null)
    setEnviando(true)
    try {
      await enviarImagem(produto.id_produto, arquivo)
      await aoMudar()
      setSucesso('Imagem salva.')
    } catch (err) {
      setErro(mensagemDe(err, 'Não foi possível enviar a imagem. Tente novamente.'))
    } finally {
      setEnviando(false)
      if (entrada.current) entrada.current.value = ''
    }
  }

  const remover = async () => {
    setErro(null)
    setSucesso(null)
    try {
      await removerImagem(produto.id_produto)
      await aoMudar()
      setSucesso('Imagem removida.')
    } catch (err) {
      setErro(mensagemDe(err, 'Não foi possível remover a imagem. Tente novamente.'))
    }
  }

  return (
    <section className="cartao p-6" aria-labelledby="titulo-imagem">
      <h2 id="titulo-imagem" className="titulo-card">Imagem</h2>
      <div className="mt-4 flex items-center gap-4">
        <Miniatura imagem={produto.imagem} tamanho="xl" />
        <p className="text-sm text-slate-600">{produto.imagem ? 'Esta é a imagem que aparece na loja.' : 'Este produto ainda não tem imagem.'}</p>
      </div>

      <div className="mt-4 space-y-3">
        {erro && <Aviso tom="erro">{erro}</Aviso>}
        {sucesso && <Aviso tom="sucesso">{sucesso}</Aviso>}
        <input
          ref={entrada}
          type="file"
          name="imagem"
          accept="image/jpeg,image/png,image/webp"
          aria-label="Escolher imagem"
          disabled={enviando}
          onChange={(e) => escolher(e.target.files?.[0])}
          className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-600 hover:file:bg-brand-100"
        />
        <p className="flex items-center gap-1.5 text-xs text-slate-500"><ImagePlus size={14} /> JPEG, PNG ou WEBP, até 2 MB. {enviando && 'Enviando...'}</p>
        {produto.imagem && (
          <div className="flex items-center gap-2 text-red-600"><Trash2 size={14} /><BotaoConfirmar rotulo="Remover imagem" pergunta="Remover a imagem?" aoConfirmar={remover} /></div>
        )}
      </div>
    </section>
  )
}
