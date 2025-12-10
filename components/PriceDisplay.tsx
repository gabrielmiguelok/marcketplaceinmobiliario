"use client"

import { useCurrency } from "@/lib/currency-context"

interface PriceDisplayProps {
  precioUsd: number | string
  precioGtq: number | string
  className?: string
}

export function PriceDisplay({ precioUsd, precioGtq, className }: PriceDisplayProps) {
  const { formatPrice } = useCurrency()
  return <span className={className}>{formatPrice(precioUsd, precioGtq)}</span>
}
