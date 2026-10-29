const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const validationMessage = body.errors
      ? Object.values(body.errors).flat().join(' ')
      : body.message
    throw new Error(validationMessage || 'Une erreur est survenue. Veuillez réessayer.')
  }

  return body
}

export function dateValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(value, days) {
  const date = new Date(`${value}T12:00:00`)
  date.setDate(date.getDate() + days)
  return dateValue(date)
}

export function localDateTimeToIso(date, time) {
  return new Date(`${date}T${time}:00`).toISOString()
}

export function formatSlot(slot) {
  const start = new Date(slot.starts_at)
  const end = new Date(slot.ends_at)
  const day = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(start)
  const time = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return { day: day.replace('.', ''), time: `${time.format(start)} – ${time.format(end)}` }
}

export function formatFullDate(value) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
