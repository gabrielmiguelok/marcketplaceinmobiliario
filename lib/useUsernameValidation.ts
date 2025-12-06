"use client"

import { useState, useCallback, useRef, useEffect } from "react"

export interface UsernameValidationState {
  status: "idle" | "checking" | "available" | "taken" | "invalid" | "error" | "own"
  message: string
  normalized: string
}

interface CheckUsernameResponse {
  success: boolean
  available?: boolean
  normalized?: string
  reason?: "invalid_format" | "taken"
  message?: string
  isOwn?: boolean
  error?: string
}

const DEBOUNCE_MS = 400

function normalizeUsernameClient(username: string): string {
  return username
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function validateFormatClient(username: string): { valid: boolean; error?: string } {
  if (!username || username.length === 0) {
    return { valid: false, error: "Ingresa un nombre de usuario" }
  }

  if (username.length < 3) {
    return { valid: false, error: "Mínimo 3 caracteres" }
  }

  if (username.length > 50) {
    return { valid: false, error: "Máximo 50 caracteres" }
  }

  if (!/^[a-z0-9]/.test(username)) {
    return { valid: false, error: "Debe comenzar con letra o número" }
  }

  if (!/^[a-z0-9-]+$/.test(username)) {
    return { valid: false, error: "Solo letras, números y guiones" }
  }

  if (/--/.test(username)) {
    return { valid: false, error: "Sin guiones consecutivos" }
  }

  if (/-$/.test(username)) {
    return { valid: false, error: "No puede terminar en guión" }
  }

  return { valid: true }
}

export function useUsernameValidation(initialUsername: string = "") {
  const [validation, setValidation] = useState<UsernameValidationState>({
    status: initialUsername ? "own" : "idle",
    message: initialUsername ? "Tu usuario actual" : "",
    normalized: initialUsername,
  })

  const [inputValue, setInputValue] = useState(initialUsername)
  const abortControllerRef = useRef<AbortController | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const initialUsernameRef = useRef(initialUsername)

  useEffect(() => {
    initialUsernameRef.current = initialUsername
    if (initialUsername && inputValue === "") {
      setInputValue(initialUsername)
      setValidation({
        status: "own",
        message: "Tu usuario actual",
        normalized: initialUsername,
      })
    }
  }, [initialUsername])

  const checkUsername = useCallback(async (username: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const normalized = normalizeUsernameClient(username)

    if (!normalized) {
      setValidation({
        status: "idle",
        message: "",
        normalized: "",
      })
      return
    }

    if (normalized === initialUsernameRef.current) {
      setValidation({
        status: "own",
        message: "Tu usuario actual",
        normalized,
      })
      return
    }

    const formatCheck = validateFormatClient(normalized)
    if (!formatCheck.valid) {
      setValidation({
        status: "invalid",
        message: formatCheck.error || "Formato inválido",
        normalized,
      })
      return
    }

    setValidation({
      status: "checking",
      message: "Verificando disponibilidad...",
      normalized,
    })

    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch(
        `/api/doctor/check-username?username=${encodeURIComponent(normalized)}`,
        { signal: abortControllerRef.current.signal }
      )

      const data: CheckUsernameResponse = await response.json()

      if (!data.success) {
        setValidation({
          status: "error",
          message: data.error || "Error al verificar",
          normalized,
        })
        return
      }

      if (data.isOwn) {
        setValidation({
          status: "own",
          message: "Tu usuario actual",
          normalized: data.normalized || normalized,
        })
        return
      }

      if (data.available) {
        setValidation({
          status: "available",
          message: "¡Disponible!",
          normalized: data.normalized || normalized,
        })
      } else {
        setValidation({
          status: data.reason === "invalid_format" ? "invalid" : "taken",
          message: data.message || "No disponible",
          normalized: data.normalized || normalized,
        })
      }
    } catch (error: any) {
      if (error.name === "AbortError") return

      setValidation({
        status: "error",
        message: "Error de conexión",
        normalized,
      })
    }
  }, [])

  const handleUsernameChange = useCallback((value: string) => {
    setInputValue(value)

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    const normalized = normalizeUsernameClient(value)

    if (!normalized) {
      setValidation({
        status: "idle",
        message: "",
        normalized: "",
      })
      return
    }

    if (normalized === initialUsernameRef.current) {
      setValidation({
        status: "own",
        message: "Tu usuario actual",
        normalized,
      })
      return
    }

    const formatCheck = validateFormatClient(normalized)
    if (!formatCheck.valid) {
      setValidation({
        status: "invalid",
        message: formatCheck.error || "Formato inválido",
        normalized,
      })
      return
    }

    setValidation({
      status: "checking",
      message: "Verificando...",
      normalized,
    })

    debounceTimerRef.current = setTimeout(() => {
      checkUsername(value)
    }, DEBOUNCE_MS)
  }, [checkUsername])

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    setInputValue(initialUsernameRef.current)
    setValidation({
      status: initialUsernameRef.current ? "own" : "idle",
      message: initialUsernameRef.current ? "Tu usuario actual" : "",
      normalized: initialUsernameRef.current,
    })
  }, [])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const canSubmit = validation.status === "available" || validation.status === "own" || validation.status === "idle"

  return {
    inputValue,
    validation,
    handleUsernameChange,
    reset,
    canSubmit,
    normalizedValue: validation.normalized,
  }
}
