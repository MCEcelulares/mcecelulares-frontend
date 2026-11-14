import { AlertaErro } from '../auth/AuthShell'
import { classeBotao } from '../ui/botao'
import { Campo, CampoSelect } from '../ui/Campo'
import { useFormulario, type Erros } from '../../hooks/useFormulario'
import { atualizarEndereco, criarEndereco, ESTADOS, type Endereco } from '../../lib/enderecos'
import { mascararCep, soDigitos } from '../../lib/mascaras'


const VAZIO = { cep: '', endereco: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' }

function validar(v: typeof VAZIO): Erros<typeof VAZIO> {
  const erros: Erros<typeof VAZIO> = {}
  if (soDigitos(v.cep).length !== 8) erros.cep = 'CEP inválido.'
  if (v.endereco.trim().length < 2) erros.endereco = 'Informe a rua ou avenida.'
  if (!v.numero.trim()) erros.numero = 'Informe o número.'
  if (v.cidade.trim().length < 2) erros.cidade = 'Informe a cidade.'
  if (!(ESTADOS as readonly string[]).includes(v.estado)) erros.estado = 'Selecione o estado.'
  return erros
}

interface Props {
  idUsuario: number
  onSalvo: (endereco: Endereco) => void
  onCancelar?: () => void
  /** Se informado, o formulário edita este endereço em vez de criar um novo. */
  endereco?: Endereco
}

const valoresIniciais = (e?: Endereco): typeof VAZIO =>
  e
    ? { cep: mascararCep(e.cep), endereco: e.endereco, numero: e.numero, complemento: e.complemento ?? '', bairro: e.bairro ?? '', cidade: e.cidade, estado: e.estado }
    : VAZIO

export function FormEndereco({ idUsuario, onSalvo, onCancelar, endereco: emEdicao }: Props) {
  const { valores, erros, erroGeral, enviando, alterar, enviar } = useFormulario({
    inicial: () => valoresIniciais(emEdicao),
    validar,
    enviar: async (v) => {
      const dados = { endereco: v.endereco.trim(), numero: v.numero.trim(), cidade: v.cidade.trim(), estado: v.estado, cep: v.cep }
      // Na edição, '' limpa o campo; na criação, campo vazio simplesmente não é enviado.
      const salvo = emEdicao
        ? await atualizarEndereco(idUsuario, emEdicao.id_endereco, { ...dados, complemento: v.complemento.trim(), bairro: v.bairro.trim() })
        : await criarEndereco(idUsuario, { ...dados, complemento: v.complemento.trim() || undefined, bairro: v.bairro.trim() || undefined })
      onSalvo(salvo)
    },
    mensagemPadrao: 'Não foi possível salvar o endereço. Tente novamente.',
    manterEnviando: true,
  })

  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      {erroGeral && <AlertaErro mensagem={erroGeral} />}

      <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
        <Campo label="CEP" name="cep" inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" value={valores.cep} onChange={(e) => alterar('cep', mascararCep(e.target.value))} erro={erros.cep} />
        <Campo label="Endereço (Rua, Av.)" name="endereco" autoComplete="address-line1" placeholder="Ex: Avenida Paulista" value={valores.endereco} onChange={(e) => alterar('endereco', e.target.value)} erro={erros.endereco} />
      </div>

      <div className="grid gap-5 sm:grid-cols-[120px_1fr_1fr]">
        <Campo label="Número" name="numero" autoComplete="off" placeholder="Ex: 123" value={valores.numero} onChange={(e) => alterar('numero', e.target.value)} erro={erros.numero} />
        <Campo label="Complemento" name="complemento" autoComplete="address-line2" placeholder="Apt, Bloco, etc." value={valores.complemento} onChange={(e) => alterar('complemento', e.target.value)} erro={erros.complemento} />
        <Campo label="Bairro" name="bairro" placeholder="Ex: Bela Vista" value={valores.bairro} onChange={(e) => alterar('bairro', e.target.value)} erro={erros.bairro} />
      </div>

      <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
        <Campo label="Cidade" name="cidade" autoComplete="address-level2" placeholder="Ex: São Paulo" value={valores.cidade} onChange={(e) => alterar('cidade', e.target.value)} erro={erros.cidade} />
        <CampoSelect label="Estado" name="estado" autoComplete="address-level1" value={valores.estado} onChange={(e) => alterar('estado', e.target.value)} erro={erros.estado}>
          <option value="">UF</option>
          {ESTADOS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
        </CampoSelect>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {onCancelar && (
          <button type="button" onClick={onCancelar} className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-slate-50">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={enviando} className={classeBotao('primario', 'md', 'text-sm')}>
          {enviando ? 'Salvando...' : 'Salvar Endereço'}
        </button>
      </div>
    </form>
  )
}
