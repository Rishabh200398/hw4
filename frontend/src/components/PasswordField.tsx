import { useId, useState } from 'react'

interface Props {
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  placeholder?: string
  required?: boolean
  describedById?: string
}

// Password input with a show/hide toggle on the right.
export default function PasswordField({
  label,
  value,
  onChange,
  autoComplete = 'new-password',
  placeholder,
  required = true,
  describedById,
}: Props) {
  const [visible, setVisible] = useState(false)
  const id = useId()

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="password-wrap">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
          aria-describedby={describedById}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  )
}
