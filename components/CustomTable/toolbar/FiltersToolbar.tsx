/**
 * Archivo: /components/CustomTable/toolbar/FiltersToolbar.tsx
 * LICENSE: MIT
 */
"use client"

import type React from "react"
import { IconButton, Tooltip, TextField } from "@mui/material"
import { Moon, Sun, ChevronLeft, ChevronRight, Plus, Save, Check } from "lucide-react"

export type AddRecordState = 'idle' | 'adding' | 'saving' | 'confirmed';

export interface FiltersToolbarProps {
  globalFilterValue?: string
  onGlobalFilterChange: (value: string) => void
  onDownloadExcel?: () => void
  onRefresh?: () => void
  onThemeToggle?: () => void
  isDarkMode?: boolean
  paginationInfo?: {
    currentPage: number
    totalPages: number
    total: number
    onPageChange: (page: number) => void
  }
  // Nueva prop para agregar registros
  onAddRecord?: () => void
  addRecordState?: AddRecordState
}

export default function FiltersToolbar({
  globalFilterValue = "",
  onGlobalFilterChange,
  onDownloadExcel,
  onRefresh,
  onThemeToggle,
  isDarkMode = false,
  paginationInfo,
  onAddRecord,
  addRecordState = 'idle',
}: FiltersToolbarProps) {
  const handleThemeToggle = () => {
    if (onThemeToggle) onThemeToggle()
  }

  // Theme colors
  const colors = isDarkMode
    ? {
        bg: "oklch(0.15 0.01 240)",
        text: "oklch(0.98 0.002 240)",
        inputBg: "oklch(0.18 0.01 240)",
        inputText: "oklch(0.98 0.002 240)",
        inputBorder: "oklch(0.22 0.02 240)",
        placeholder: "oklch(0.6 0.02 240)",
      }
    : {
        bg: "oklch(0.99 0.002 240)",
        text: "oklch(0.2 0.04 240)",
        inputBg: "oklch(1 0 0)",
        inputText: "oklch(0.2 0.04 240)",
        inputBorder: "oklch(0.92 0.004 240)",
        placeholder: "oklch(0.5 0.02 240)",
      }

  const toolbarStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    background: colors.bg,
    height: "48px",
    maxWidth: "100%",
    padding: "0 8px",
    gap: "8px",
    boxSizing: "border-box",
  }

  return (
    <div style={toolbarStyle}>
      {/* Filtro global */}
      <TextField
        variant="outlined"
        size="small"
        placeholder="Búsqueda global"
        value={globalFilterValue}
        onChange={(e) => onGlobalFilterChange(e.target.value)}
        sx={{
          width: "220px",
          "& .MuiOutlinedInput-root": {
            backgroundColor: colors.inputBg,
            borderRadius: "8px",
            minHeight: "32px",
            lineHeight: 1.2,
            "& fieldset": {
              borderColor: colors.inputBorder,
            },
            "&:hover fieldset": {
              borderColor: "#127CF3",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#127CF3",
              borderWidth: "2px",
            },
            "& input": {
              padding: "6px 12px",
              fontSize: "0.875rem",
              color: colors.inputText,
              "&::placeholder": {
                color: colors.placeholder,
                opacity: 1,
              },
            },
          },
        }}
      />

      {paginationInfo && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
          <span style={{ fontSize: "13px", color: colors.text }}>
            Página {paginationInfo.currentPage} de {paginationInfo.totalPages} ({paginationInfo.total} registros)
          </span>
          <Tooltip title="Página anterior" arrow>
            <span>
              <IconButton
                size="small"
                onClick={() => paginationInfo.onPageChange(paginationInfo.currentPage - 1)}
                disabled={paginationInfo.currentPage <= 1}
                sx={{ color: colors.text }}
                aria-label="Página anterior"
              >
                <ChevronLeft size={20} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Página siguiente" arrow>
            <span>
              <IconButton
                size="small"
                onClick={() => paginationInfo.onPageChange(paginationInfo.currentPage + 1)}
                disabled={paginationInfo.currentPage >= paginationInfo.totalPages}
                sx={{ color: colors.text }}
                aria-label="Página siguiente"
              >
                <ChevronRight size={20} />
              </IconButton>
            </span>
          </Tooltip>
        </div>
      )}

      {/* Agregar nuevo registro */}
      {onAddRecord && (
        <Tooltip
          title={
            addRecordState === 'idle' ? 'Agregar nuevo registro' :
            addRecordState === 'adding' ? 'Guardar registro' :
            addRecordState === 'saving' ? 'Guardando...' :
            'Registro guardado'
          }
          arrow
        >
          <span>
            <IconButton
              size="small"
              onClick={onAddRecord}
              disabled={addRecordState === 'saving' || addRecordState === 'confirmed'}
              sx={{
                color: addRecordState === 'idle' ? '#127CF3' :
                       addRecordState === 'adding' ? '#f59e0b' :
                       addRecordState === 'confirmed' ? '#10b981' :
                       colors.text,
                marginLeft: paginationInfo ? 0 : "auto",
                backgroundColor: addRecordState === 'adding' ? 'rgba(245, 158, 11, 0.1)' :
                                 addRecordState === 'confirmed' ? 'rgba(16, 185, 129, 0.1)' :
                                 'transparent',
                '&:hover': {
                  backgroundColor: addRecordState === 'idle' ? 'rgba(18, 124, 243, 0.1)' :
                                   addRecordState === 'adding' ? 'rgba(245, 158, 11, 0.2)' :
                                   addRecordState === 'confirmed' ? 'rgba(16, 185, 129, 0.2)' :
                                   undefined,
                },
                '&.Mui-disabled': {
                  color: colors.text,
                  opacity: 0.5,
                }
              }}
              aria-label={
                addRecordState === 'idle' ? 'Agregar registro' :
                addRecordState === 'adding' ? 'Guardar' :
                'Guardando'
              }
            >
              {addRecordState === 'idle' && <Plus size={18} />}
              {addRecordState === 'adding' && <Save size={18} />}
              {(addRecordState === 'saving' || addRecordState === 'confirmed') && <Check size={18} />}
            </IconButton>
          </span>
        </Tooltip>
      )}

      {/* Descargar Excel (opcional) */}
      {onDownloadExcel && (
        <Tooltip title="Descargar datos en formato Excel" arrow>
          <IconButton
            size="small"
            onClick={onDownloadExcel}
            sx={{ color: colors.text, marginLeft: (paginationInfo || onAddRecord) ? 0 : "auto" }}
            aria-label="Descargar Excel"
          >
            <svg fill="currentColor" height="18" width="18" viewBox="0 0 24 24">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18h14v2H5z" />
            </svg>
          </IconButton>
        </Tooltip>
      )}

      {/* Tema */}
      <Tooltip title="Cambiar entre modo claro y oscuro" arrow>
        <IconButton
          onClick={handleThemeToggle}
          sx={{
            color: colors.text,
            fontSize: "18px",
            "&:hover": {
              backgroundColor: isDarkMode ? "rgba(18,124,243,0.12)" : "rgba(18,124,243,0.08)",
            }
          }}
          aria-label="Cambiar tema"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </IconButton>
      </Tooltip>

      {/* Refrescar (opcional) */}
      {onRefresh && (
        <Tooltip title="Refrescar datos" arrow>
          <IconButton
            size="small"
            onClick={onRefresh}
            sx={{ color: colors.text }}
            aria-label="Refrescar"
          >
            <svg fill="currentColor" height="18" width="18" viewBox="0 0 24 24">
              <path d="M13 2v2a7 7 0 0 1 6.935 6.058l1.928-.517A9 9 0 0 0 13 2zm-2 0a9 9 0 0 0-8.863 7.541l1.928.517A7 7 0 0 1 11 4V2zM4.137 14.925l-1.928.517A9 9 0 0 0 11 22v-2a7 7 0 0 1-6.863-5.075zM13 22a9 9 0 0 0 8.863-7.541l-1.928-.517A7 7 0 0 1 13 20v2z" />
            </svg>
          </IconButton>
        </Tooltip>
      )}
    </div>
  )
}
