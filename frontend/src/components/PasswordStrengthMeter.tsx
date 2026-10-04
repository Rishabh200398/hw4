import type { PasswordStrength } from '../passwordStrength'

const LABELS: Record<PasswordStrength['level'], string> = {
  empty: '',
  weak: 'Weak password',
  fair: 'Almost there',
  strong: 'Strong password',
}

export default function PasswordStrengthMeter({ strength, id }: { strength: PasswordStrength; id?: string }) {
  if (strength.level === 'empty') return null

  return (
    <div className="pw-strength" id={id}>
      <div className={`pw-bar ${strength.level}`}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={i < strength.score ? 'on' : ''} />
        ))}
      </div>
      <p className={`pw-level ${strength.level}`}>{LABELS[strength.level]}</p>
      <ul className="pw-rules">
        {strength.rules.map((rule) => (
          <li key={rule.label} className={rule.passed ? 'ok' : 'todo'}>
            <span aria-hidden="true">{rule.passed ? '✓' : '○'}</span> {rule.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
