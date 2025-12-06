"use client"

import type React from "react"
import { useRef } from "react"
import type { Row } from "@tanstack/react-table"
import getSafeDisplayValue from "../utils/getSafeDisplayValue"
import { STYLES_CONFIG } from "../../config"
import CustomSelectDropdown from "./CustomSelectDropdown"
import ImageUploadCell from "./ImageUploadCell"

type Props = {
  rows: Row<any>[]
  rowHeight: number
  isEditingCell: (rowId: string, colId: string) => boolean
  editingValue: string
  handleSingleClick?: (rowId: string, colId: string, initialValue?: string | number) => void
  handleDoubleClick: (rowId: string, colId: string, initialValue?: string | number) => void
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleEditKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleBlur: () => void
  setInputRef?: (element: HTMLInputElement | HTMLTextAreaElement | null) => void
  selectedCells: { id: string; colField: string }[]
  copiedCells: { id: string; colField: string }[]
  handleCellClick: (rIndex: number) => void
  onRowIndexMouseDown: (evt: MouseEvent, rowIndex: number, rowId: string) => void
  onRowIndexTouchStart: (evt: TouchEvent, rowIndex: number, rowId: string) => void
  highlightedRowIndex: number | null
  isDarkMode?: boolean
}

const SELECTED_CELL_CLASS = "selected-cell-rect"
const COPIED_CELL_CLASS = "copied-cell-rect"

export default function TableBody({
  rows,
  rowHeight,
  isEditingCell,
  editingValue,
  handleSingleClick,
  handleDoubleClick,
  handleChange,
  handleEditKeyDown,
  handleBlur,
  setInputRef,
  selectedCells,
  copiedCells,
  handleCellClick,
  onRowIndexMouseDown,
  onRowIndexTouchStart,
  highlightedRowIndex,
  isDarkMode = false,
}: Props) {
  return (
    <>
      <tbody>
        {rows.map((row, rIndex) => {
          const rowId = String(row.id)
          const rowIsHighlighted = highlightedRowIndex === rIndex

          // Highlight con colores Synara: azul suave
          const highlightColor = isDarkMode
            ? "rgba(18,124,243,0.18)" // Synara primary blue 18%
            : "rgba(18,124,243,0.14)" // Synara primary blue 14%

          return (
            <tr
              key={rowId}
              data-rowindex={rIndex}
              style={{
                height: rowHeight,
                backgroundColor: rowIsHighlighted ? highlightColor : "transparent",
                transition: "background-color 120ms ease",
              }}
            >
              {row.getVisibleCells().map((cell, cIndex) => {
                const colId = cell.column.id
                const isIndexCol = colId === "_selectIndex"

                const isSelected = selectedCells.some((sc) => sc.id === rowId && sc.colField === colId)
                const isCopied = copiedCells.some((cc) => cc.id === rowId && cc.colField === colId)

                const inEditingMode = isEditingCell(rowId, colId)
                const rawValue = cell.getValue()

                const customRender = cell.column.columnDef.cell
                  ? cell.column.columnDef.cell({
                      getValue: () => rawValue,
                      column: cell.column,
                      row: cell.row,
                      table: cell.table,
                    })
                  : rawValue

                // Obtener metadata de la columna
                const columnMeta = cell.column.columnDef as any
                let selectOptions = Array.isArray(columnMeta?.options) ? columnMeta.options : []
                const isNumericColumn = columnMeta?.isNumeric || false
                const textAlign = columnMeta?.textAlign || (isNumericColumn ? 'right' : 'left')

                // Filtrar opciones si hay filterOptionsBy definido
                if (columnMeta?.filterOptionsBy && selectOptions.length > 0) {
                  const filterField = columnMeta.filterOptionsBy
                  const filterValue = row.original?.[filterField]
                  if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
                    selectOptions = selectOptions.filter((opt: any) =>
                      String(opt[filterField]) === String(filterValue)
                    )
                  }
                }

                // Detectar editabilidad desde la metadata de la columna
                const isCellEditable = columnMeta?.editable !== false && !isIndexCol
                const editType = columnMeta?.editType || 'text'

                // VALIDACIÓN EXTREMADAMENTE ROBUSTA: Solo es select si tiene editType='select' Y tiene opciones válidas
                const isSelectField = Boolean(
                  editType === 'select' &&
                  Array.isArray(selectOptions) &&
                  selectOptions.length > 0
                )
                const isNumericField = editType === 'numeric'

                // Detectar tipo de columna para el dropdown personalizado
                const columnType = columnMeta?.type || 'text'
                const isImageColumn = columnType === 'image'
                const dropdownType: 'country' | 'badge' | 'text' | 'foreignKey' =
                  columnType === 'country' ? 'country' :
                  columnType === 'badge' ? 'badge' :
                  columnType === 'foreignKey' ? 'foreignKey' : 'text'

                // IMPORTANTE: SIEMPRE usar customRender cuando NO está en edición
                // customRender ya tiene los renders personalizados (banderas, badges con colores, etc)
                // EXCEPCIÓN: columnas de imagen usan componente especial
                const displayValue = isImageColumn ? null : getSafeDisplayValue(customRender)

                const imageCellContent = isImageColumn ? (
                  <ImageUploadCell
                    imageUrl={rawValue as string | null}
                    rowId={String(row.original?.id || rowId)}
                    size={columnMeta?.imageSize || 32}
                    onImageUpload={columnMeta?.onImageUpload}
                    isDarkMode={isDarkMode}
                  />
                ) : null

                // Render select dropdown, numeric input or textarea based on field type
                const cellContent = isImageColumn ? imageCellContent : (
                  inEditingMode ? (
                    isSelectField ? (
                      <CustomSelectDropdown
                        value={editingValue}
                        options={selectOptions}
                        onChange={(newValue) => {
                          console.log('🔄 [TABLEBODY] onChange recibido:', { rowId, colId, newValue });
                          const syntheticEvent = {
                            target: { value: newValue }
                          } as React.ChangeEvent<HTMLInputElement>;
                          handleChange(syntheticEvent);
                        }}
                        onBlur={() => {
                          console.log('💾 [TABLEBODY] onBlur ejecutado para guardar');
                          handleBlur();
                        }}
                        onKeyDown={handleEditKeyDown}
                        columnType={dropdownType}
                        colId={colId}
                        isDarkMode={isDarkMode}
                        allowCreate={columnMeta?.allowCreate || false}
                        onCreateOption={columnMeta?.onCreateOption}
                        dataset={columnMeta?.dataset}
                      />
                    ) : isNumericField ? (
                      <input
                        ref={setInputRef as any}
                        type="number"
                        autoFocus
                        value={editingValue}
                        onChange={handleChange}
                        onKeyDown={handleEditKeyDown}
                        onBlur={handleBlur}
                        step="any"
                        min={columnMeta?.min}
                        max={columnMeta?.max}
                        style={{
                          width: "100%",
                          border: "none",
                          outline: "none",
                          padding: 0,
                          margin: 0,
                          backgroundColor: "transparent",
                          color: "var(--color-text)",
                          fontSize: "inherit",
                          textAlign: "right",
                        }}
                        aria-label="Editar celda numérica"
                      />
                    ) : (
                      <textarea
                        ref={setInputRef}
                        value={editingValue}
                        onChange={handleChange}
                        onKeyDown={handleEditKeyDown}
                        onBlur={handleBlur}
                        rows={1}
                        style={{
                          width: "100%",
                          border: "none",
                          outline: "none",
                          padding: 0,
                          margin: 0,
                          backgroundColor: "transparent",
                          color: "var(--color-text)",
                          resize: "vertical",
                          minHeight: "20px",
                          maxHeight: "200px",
                          overflow: "auto",
                          whiteSpace: "pre-wrap",
                        }}
                        aria-label="Editar celda"
                      />
                    )
                  ) : (
                    displayValue
                  )
                )

                return (
                  <td
                    key={cell.id}
                    data-rowid={rowId}
                    data-rowindex={rIndex}
                    data-colindex={cIndex}
                    className={`custom-td ${isSelected ? SELECTED_CELL_CLASS : ""} ${isCopied ? COPIED_CELL_CLASS : ""}`}
                    style={{
                      backgroundColor: isIndexCol ? "var(--color-table-index-body)" : "inherit",
                      fontWeight: isIndexCol ? 600 : 400,
                      cursor: isIndexCol ? "pointer" : (isCellEditable ? "text" : "default"),
                      color: "var(--color-text)",
                      padding: STYLES_CONFIG.cell.padding,
                      fontSize: STYLES_CONFIG.cell.fontSize,
                      height: rowHeight,
                      maxHeight: rowHeight,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      verticalAlign: "middle",
                      textAlign: textAlign as any,
                    }}
                    onClick={(e) => {
                      handleCellClick(rIndex);
                    }}
                    onDoubleClick={() => {
                      if (isCellEditable) {
                        handleDoubleClick(rowId, colId, rawValue as any);
                      }
                    }}
                    onMouseDown={(evt) => {
                      if (isIndexCol) onRowIndexMouseDown(evt.nativeEvent, rIndex, rowId)
                    }}
                    onTouchStart={(evt) => {
                      if (isIndexCol && evt.touches.length === 1) onRowIndexTouchStart(evt.nativeEvent, rIndex, rowId)
                    }}
                  >
                    {cellContent}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>

      {/* Recuadros de selección/copied delicados al estilo Synara */}
      <style jsx>{`
        td.custom-td {
          position: relative;
          border-bottom: 1px solid var(--color-divider);
          border-right: none;
          transition: background-color 150ms ease, box-shadow 150ms ease;
        }

        /* Selección delicada: borde suave azul Synara */
        td.${SELECTED_CELL_CLASS} {
          background: rgba(18, 124, 243, 0.04);
          box-shadow: inset 0 0 0 1px rgba(18, 124, 243, 0.3);
          outline: none;
          position: relative;
          z-index: 1;
        }

        /* Copiado: flash sutil en celeste claro con borde delicado */
        td.${COPIED_CELL_CLASS} {
          background: rgba(40, 168, 255, 0.12);
          box-shadow: inset 0 0 0 1px rgba(40, 168, 255, 0.4);
          animation: copiedFlash 1000ms ease;
          position: relative;
          z-index: 2;
        }

        @keyframes copiedFlash {
          0%   {
            background: rgba(40, 168, 255, 0.18);
            box-shadow: inset 0 0 0 1px rgba(40, 168, 255, 0.5);
          }
          100% {
            background: rgba(40, 168, 255, 0.05);
            box-shadow: inset 0 0 0 1px rgba(40, 168, 255, 0.15);
          }
        }
      `}</style>
    </>
  )
}
