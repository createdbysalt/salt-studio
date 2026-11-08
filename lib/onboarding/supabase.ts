export function supabaseConfig() {
  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) return null
  return {url: url.replace(/\/$/, ''), serviceRoleKey}
}

export async function supabaseRequest<T>(path: string, init: RequestInit = {}) {
  const config = supabaseConfig()
  if (!config) throw new Error('Supabase private storage is not configured.')

  const response = await fetch(`${config.url}${path}`, {
    ...init,
    headers: {
      'apikey': config.serviceRoleKey,
      'Authorization': `Bearer ${config.serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })

  if (!response.ok) throw new Error(`Supabase request failed with ${response.status}`)
  return response.json() as Promise<T>
}
