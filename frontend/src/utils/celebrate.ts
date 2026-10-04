// A lightweight confetti burst + toast, no dependencies. Used when an item is actually
// added to the cart.
const COLORS = ['#00366b', '#f04f36', '#f4c430', '#ffffff', '#4d90c7']

export function celebrate(message: string): void {
  showToast(message)
  burstConfetti()
}

function showToast(message: string): void {
  const toast = document.createElement('div')
  toast.className = 'cc-toast'
  toast.textContent = `🎉 ${message}`
  document.body.appendChild(toast)
  requestAnimationFrame(() => toast.classList.add('show'))
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 400)
  }, 2000)
}

function burstConfetti(): void {
  const canvas = document.createElement('canvas')
  canvas.className = 'cc-confetti'
  const dpr = window.devicePixelRatio || 1
  const W = window.innerWidth
  const H = window.innerHeight
  canvas.width = W * dpr
  canvas.height = H * dpr
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  const N = 140
  const parts = Array.from({ length: N }, () => ({
    x: W / 2 + (Math.random() - 0.5) * 120,
    y: H / 3 + (Math.random() - 0.5) * 60,
    vx: (Math.random() - 0.5) * 12,
    vy: Math.random() * -12 - 4,
    size: Math.random() * 7 + 4,
    color: COLORS[(Math.random() * COLORS.length) | 0],
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.3,
  }))

  const start = performance.now()
  const DURATION = 1600

  function frame(now: number) {
    const t = now - start
    ctx.clearRect(0, 0, W, H)
    for (const p of parts) {
      p.vy += 0.35 // gravity
      p.x += p.vx
      p.y += p.vy
      p.vx *= 0.99
      p.rot += p.vr
      ctx.save()
      ctx.globalAlpha = Math.max(0, 1 - t / DURATION)
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      ctx.restore()
    }
    if (t < DURATION) {
      requestAnimationFrame(frame)
    } else {
      canvas.remove()
    }
  }
  requestAnimationFrame(frame)
}
