// Scores a password against the Campus Customs account rules.
// Each rule is a hard requirement; the password is only "valid" when all pass.

export interface PasswordRule {
  label: string
  passed: boolean
}

export interface PasswordStrength {
  rules: PasswordRule[]
  valid: boolean
  score: number // 0..4 of the rules met
  level: 'empty' | 'weak' | 'fair' | 'strong'
}

const COMMON = new Set([
  'password', 'password1', 'password123', '12345678', '123456789', 'qwerty123',
  'letmein', 'iloveyou', 'admin123', 'welcome1', 'bulldog1', 'yale1234',
])

function hasSequentialRun(value: string): boolean {
  // Four or more consecutive ascending/descending digits, e.g. 1234 or 9876.
  const digits = value.replace(/\D/g, '')
  let up = 1
  let down = 1
  for (let i = 1; i < digits.length; i++) {
    const diff = digits.charCodeAt(i) - digits.charCodeAt(i - 1)
    up = diff === 1 ? up + 1 : 1
    down = diff === -1 ? down + 1 : 1
    if (up >= 4 || down >= 4) return true
  }
  return false
}

function containsName(password: string, parts: string[]): boolean {
  const lower = password.toLowerCase()
  return parts
    .map((p) => p.trim().toLowerCase())
    .filter((p) => p.length >= 3)
    .some((p) => lower.includes(p))
}

export function scorePassword(
  password: string,
  { firstName = '', lastName = '' }: { firstName?: string; lastName?: string } = {},
): PasswordStrength {
  const allDigits = /^\d+$/.test(password)
  const rules: PasswordRule[] = [
    { label: 'At least 8 characters', passed: password.length >= 8 },
    {
      label: "Doesn't contain your name or email",
      passed: password.length > 0 && !containsName(password, [firstName, lastName]),
    },
    {
      label: 'Not just a sequence or run of numbers',
      passed: password.length > 0 && !allDigits && !hasSequentialRun(password),
    },
    {
      label: 'Mixes letters, numbers or symbols',
      passed: /[a-zA-Z]/.test(password) && /[^a-zA-Z]/.test(password) && !COMMON.has(password.toLowerCase()),
    },
  ]

  if (password.length === 0) {
    return { rules, valid: false, score: 0, level: 'empty' }
  }

  const score = rules.filter((r) => r.passed).length
  const valid = rules.every((r) => r.passed)
  const level = valid ? 'strong' : score >= 3 ? 'fair' : 'weak'
  return { rules, valid, score, level }
}
