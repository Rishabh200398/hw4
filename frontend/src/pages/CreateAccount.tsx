import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import PasswordField from '../components/PasswordField'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'
import { scorePassword } from '../passwordStrength'

export default function CreateAccount() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (field: keyof typeof form) => (value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    setError(null)
  }

  const strength = useMemo(
    () => scorePassword(form.password, { firstName: form.first_name, lastName: form.last_name }),
    [form.password, form.first_name, form.last_name],
  )

  const confirmMismatch = form.confirm.length > 0 && form.confirm !== form.password
  const canSubmit =
    form.first_name.trim() !== '' &&
    form.last_name.trim() !== '' &&
    form.email.trim() !== '' &&
    strength.valid &&
    form.password === form.confirm

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!strength.valid) {
      setError('Please choose a stronger password that meets all the requirements.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      await register({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      navigate('/products')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <h1>Create account</h1>
        <p className="muted">Join to save your chats and get personal recommendations.</p>

        <div className="form-row">
          <div className="field">
            <label htmlFor="first-name">First name</label>
            <input
              id="first-name"
              autoComplete="given-name"
              value={form.first_name}
              onChange={(e) => update('first_name')(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="last-name">Last name</label>
            <input
              id="last-name"
              autoComplete="family-name"
              value={form.last_name}
              onChange={(e) => update('last_name')(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update('email')(e.target.value)}
            required
          />
        </div>

        <PasswordField
          label="Password"
          value={form.password}
          onChange={update('password')}
          describedById="pw-strength"
        />
        <PasswordStrengthMeter strength={strength} id="pw-strength" />

        <PasswordField label="Confirm password" value={form.confirm} onChange={update('confirm')} />
        {confirmMismatch && <p className="field-error">Passwords don't match yet.</p>}

        {error && <div className="notice error" role="alert">{error}</div>}

        <button className="btn btn-primary btn-block" disabled={submitting || !canSubmit}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
        <p className="muted center">
          Already have an account? <Link to="/login" className="text-link">Log in</Link>
        </p>
      </form>
    </section>
  )
}
