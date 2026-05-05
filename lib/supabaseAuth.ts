import { supabase } from './supabaseClient'

const INVALID_REFRESH_TOKEN_MESSAGE = 'Invalid Refresh Token'

const getSupabaseStorageKeys = () => {
  const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL
    ?.replace(/^https?:\/\//, '')
    .split('.')[0]

  return projectRef
    ? [`sb-${projectRef}-auth-token`, `supabase.auth.token`]
    : ['supabase.auth.token']
}

export const isInvalidRefreshTokenError = (error: unknown) => {
  if (!error) {
    return false
  }

  const message =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : typeof error === 'object' && 'message' in error
          ? String(error.message)
          : ''

  return message.includes(INVALID_REFRESH_TOKEN_MESSAGE)
}

const clearStoredBrowserSession = () => {
  if (typeof window === 'undefined') {
    return
  }

  for (const key of getSupabaseStorageKeys()) {
    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
  }
}

export const clearInvalidBrowserSession = async () => {
  clearStoredBrowserSession()

  try {
    await supabase.auth.signOut({ scope: 'local' })
  } catch {
    // Ignore cleanup failures after local storage has already been cleared.
  }
}

export const getSessionSafely = async () => {
  try {
    const result = await supabase.auth.getSession()

    if (isInvalidRefreshTokenError(result.error)) {
      await clearInvalidBrowserSession()
      return {
        ...result,
        data: { session: null },
      }
    }

    return result
  } catch (error) {
    if (isInvalidRefreshTokenError(error)) {
      await clearInvalidBrowserSession()
      return {
        data: { session: null },
        error,
      }
    }

    throw error
  }
}

export const getUserSafely = async () => {
  try {
    const result = await supabase.auth.getUser()

    if (isInvalidRefreshTokenError(result.error)) {
      await clearInvalidBrowserSession()
      return {
        ...result,
        data: { user: null },
      }
    }

    return result
  } catch (error) {
    if (isInvalidRefreshTokenError(error)) {
      await clearInvalidBrowserSession()
      return {
        data: { user: null },
        error,
      }
    }

    throw error
  }
}

export const navigateAfterAuthChange = async (href: string) => {
  try {
    await getSessionSafely()
  } catch {
    // Ignore and continue with a hard navigation.
  }

  window.location.replace(href)
}
