'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-full bg-muted text-muted-foreground"
        aria-label="Toggle theme"
      >
        <Sun className="w-4 h-4" />
      </button>
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`
        relative p-2 rounded-full transition-all duration-300
        ${isDark
          ? 'bg-secondary text-amber-400 hover:bg-secondary/80'
          : 'bg-muted text-muted-foreground hover:bg-muted/80'}
      `}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      <div className="relative w-4 h-4">
        <Sun
          className={`
            absolute inset-0 w-4 h-4 transition-all duration-300
            ${isDark ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}
          `}
        />
        <Moon
          className={`
            absolute inset-0 w-4 h-4 transition-all duration-300
            ${isDark ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}
          `}
        />
      </div>
    </button>
  )
}
