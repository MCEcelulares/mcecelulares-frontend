import { useId, useState, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface CampoProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  erro?: string
  dica?: string
}

const estiloInput = (erro?: string) =>
  `w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 ${
    erro
      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
      : 'border-slate-200 focus:border-brand-600 focus:ring-brand-100'
  }`

export function Campo({ label, erro, dica, className = '', ...props }: CampoProps) {
  const id = useId()
  const aviso = erro ?? dica

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      <input
        id={id}
        aria-invalid={erro ? true : undefined}
        aria-describedby={aviso ? `${id}-aviso` : undefined}
        className={estiloInput(erro)}
        {...props}
      />
      {aviso && (
        <p id={`${id}-aviso`} role={erro ? 'alert' : undefined} className={`mt-1.5 text-xs ${erro ? 'text-red-600' : 'text-slate-500'}`}>
          {aviso}
        </p>
      )}
    </div>
  )
}

export function CampoTexto({
  label,
  erro,
  dica,
  className = '',
  ...props
}: { label: string; erro?: string; dica?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  const aviso = erro ?? dica

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      <textarea
        id={id}
        aria-invalid={erro ? true : undefined}
        aria-describedby={aviso ? `${id}-aviso` : undefined}
        className={`${estiloInput(erro)} resize-y`}
        {...props}
      />
      {aviso && (
        <p id={`${id}-aviso`} role={erro ? 'alert' : undefined} className={`mt-1.5 text-xs ${erro ? 'text-red-600' : 'text-slate-500'}`}>
          {aviso}
        </p>
      )}
    </div>
  )
}

export function CampoSelect({
  label,
  erro,
  className = '',
  children,
  ...props
}: { label: string; erro?: string } & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId()

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      <select id={id} aria-invalid={erro ? true : undefined} className={estiloInput(erro)} {...props}>
        {children}
      </select>
      {erro && <p role="alert" className="mt-1.5 text-xs text-red-600">{erro}</p>}
    </div>
  )
}

export function CampoSenha({ label, erro, dica, className = '', ...props }: Omit<CampoProps, 'type'>) {
  const id = useId()
  const [visivel, setVisivel] = useState(false)
  const aviso = erro ?? dica

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={visivel ? 'text' : 'password'}
          aria-invalid={erro ? true : undefined}
          aria-describedby={aviso ? `${id}-aviso` : undefined}
          className={`${estiloInput(erro)} pr-12`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-brand-600"
        >
          {visivel ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {aviso && (
        <p id={`${id}-aviso`} role={erro ? 'alert' : undefined} className={`mt-1.5 text-xs ${erro ? 'text-red-600' : 'text-slate-500'}`}>
          {aviso}
        </p>
      )}
    </div>
  )
}
