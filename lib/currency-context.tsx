"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Currency = "USD" | "GTQ"

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatPrice: (precioUsd: number | string, precioGtq: number | string) => string
  formatPriceCompact: (precioUsd: number | string, precioGtq: number | string) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const CURRENCY_STORAGE_KEY = "aloba_currency"

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD")
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY) as Currency | null
    if (stored && (stored === "USD" || stored === "GTQ")) {
      setCurrencyState(stored)
    }
    setIsHydrated(true)
  }, [])

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency)
  }

  const formatPrice = (precioUsd: number | string, precioGtq: number | string): string => {
    if (currency === "USD") {
      const precio = Number(precioUsd) || 0
      return `$${precio.toLocaleString("en-US")}`
    }
    const precio = Number(precioGtq) || 0
    return `Q${precio.toLocaleString("es-GT")}`
  }

  const formatPriceCompact = (precioUsd: number | string, precioGtq: number | string): string => {
    if (currency === "USD") {
      const precio = Number(precioUsd) || 0
      if (precio >= 1000000) return `$${(precio / 1000000).toFixed(1)}M`
      if (precio >= 1000) return `$${(precio / 1000).toFixed(0)}k`
      return `$${precio.toLocaleString("en-US")}`
    }
    const precio = Number(precioGtq) || 0
    if (precio >= 1000000) return `Q${(precio / 1000000).toFixed(1)}M`
    if (precio >= 1000) return `Q${(precio / 1000).toFixed(0)}k`
    return `Q${precio.toLocaleString("es-GT")}`
  }

  if (!isHydrated) {
    return (
      <CurrencyContext.Provider
        value={{
          currency: "USD",
          setCurrency: () => {},
          formatPrice: (precioUsd) => `$${(Number(precioUsd) || 0).toLocaleString("en-US")}`,
          formatPriceCompact: (precioUsd) => {
            const precio = Number(precioUsd) || 0
            if (precio >= 1000000) return `$${(precio / 1000000).toFixed(1)}M`
            if (precio >= 1000) return `$${(precio / 1000).toFixed(0)}k`
            return `$${precio.toLocaleString("en-US")}`
          },
        }}
      >
        {children}
      </CurrencyContext.Provider>
    )
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, formatPriceCompact }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error("useCurrency debe ser usado dentro de un CurrencyProvider")
  }
  return context
}
