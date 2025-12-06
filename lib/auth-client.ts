/**
 * FILE: lib/auth-client.ts
 * Sistema de Control - Client-side authentication utilities
 */

let isRedirecting = false
let lastVerifyCall = 0
let verifyInProgress = false
const VERIFY_THROTTLE_MS = 2000

export function clearAllCookies() {
  const cookies = document.cookie.split(";")

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i]
    const eqPos = cookie.indexOf("=")
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()

    const domains = [window.location.hostname, `.${window.location.hostname}`, "localhost"]
    const paths = ["/", "/api", "/login", "/sistema-control"]

    domains.forEach((domain) => {
      paths.forEach((path) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`
      })
    })

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  }

  try {
    localStorage.removeItem("auth")
    sessionStorage.removeItem("auth")
  } catch (e) {
  }
}

/**
 * Verify authentication with robust error handling
 * Returns user data if authenticated, null otherwise
 *
 * Features:
 * - Throttling para prevenir múltiples llamadas simultáneas
 * - Manejo elegante de errores sin cascadas
 * - Auto-limpieza de cookies inválidas
 */
export async function verifyAuthentication(options?: {
  redirectUrl?: string
  onError?: (error: Error) => void
  forceCheck?: boolean // Bypass throttle if needed
}): Promise<{ authenticated: boolean; user?: any } | null> {
  const { redirectUrl = "/login", onError, forceCheck = false } = options || {}

  // If already redirecting, don't do anything
  if (isRedirecting) {
    return null
  }

  // Throttle verify calls to prevent cascades
  const now = Date.now()
  if (!forceCheck && verifyInProgress) {
    console.log("[auth-client] Verify already in progress, skipping duplicate call")
    return null
  }

  if (!forceCheck && now - lastVerifyCall < VERIFY_THROTTLE_MS) {
    console.log("[auth-client] Verify throttled, too many requests")
    return null
  }

  verifyInProgress = true
  lastVerifyCall = now

  try {
    const response = await fetch("/api/auth/verify", {
      credentials: "include",
      cache: "no-cache",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    })

    const data = await response.json()

    // If response is not ok, handle auth failure
    if (!response.ok) {
      // Check if server already cleared the cookie
      const serverClearedCookie = data?.action === "cookie_cleared"

      if (serverClearedCookie) {
        console.log("[auth-client] Server cleared invalid session cookie")
      }

      handleAuthFailure(redirectUrl, !serverClearedCookie)
      return null
    }

    // Check if authenticated
    if (data.authenticated && data.user?.email) {
      verifyInProgress = false
      return data
    } else {
      handleAuthFailure(redirectUrl)
      return null
    }
  } catch (error) {
    console.error("[auth-client] Error verifying auth:", error)
    if (onError) {
      onError(error as Error)
    }
    handleAuthFailure(redirectUrl)
    return null
  } finally {
    verifyInProgress = false
  }
}

/**
 * Handle authentication failure - clear cookies and redirect
 * @param redirectUrl - URL to redirect to
 * @param shouldClearCookies - Whether to clear cookies (false if server already did it)
 */
function handleAuthFailure(redirectUrl: string, shouldClearCookies: boolean = true) {
  if (isRedirecting) return

  // Only redirect if redirectUrl is provided and not empty
  if (!redirectUrl || redirectUrl.trim() === "") {
    console.log("[auth-client] No redirect URL provided, skipping redirect")
    return
  }

  isRedirecting = true

  // Clear all cookies only if server didn't already do it
  if (shouldClearCookies) {
    console.log("[auth-client] Clearing cookies client-side")
    clearAllCookies()
  } else {
    console.log("[auth-client] Skipping cookie clear (server already cleared)")
  }

  // Small delay to ensure cookies are cleared
  setTimeout(() => {
    window.location.href = redirectUrl
  }, 100)
}

/**
 * Hook-friendly version that manages loading state
 */
export function useAuthVerification(redirectUrl?: string) {
  return {
    verifyAuth: () => verifyAuthentication({ redirectUrl }),
    clearCookies: clearAllCookies,
  }
}
