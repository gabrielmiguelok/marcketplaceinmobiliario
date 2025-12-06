"use client"

import * as React from "react"
import { format, setMonth, setYear, getMonth, getYear } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Clock, X, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  clearable?: boolean
  fromYear?: number
  toYear?: number
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Seleccionar fecha",
  className,
  disabled = false,
  clearable = true,
  fromYear,
  toYear,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-11",
            "bg-background border-border hover:bg-accent/50",
            "transition-all duration-200",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2.5 h-4 w-4 text-muted-foreground" />
          {date ? (
            <span className="text-foreground">
              {format(date, "d 'de' MMMM, yyyy", { locale: es })}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
          {date && clearable && (
            <X
              className="ml-auto h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                onDateChange(undefined)
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-card border-border shadow-xl rounded-xl"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          className="rounded-xl"
          fromYear={fromYear}
          toYear={toYear}
        />
      </PopoverContent>
    </Popover>
  )
}

interface BirthDatePickerProps {
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  clearable?: boolean
}

export function BirthDatePicker({
  date,
  onDateChange,
  placeholder = "Seleccionar fecha de nacimiento",
  className,
  disabled = false,
  clearable = true,
}: BirthDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<"calendar" | "month" | "year">("calendar")
  const [displayMonth, setDisplayMonth] = React.useState<Date>(date || new Date())

  const currentYear = new Date().getFullYear()
  const years = React.useMemo(() => {
    const arr = []
    for (let y = currentYear; y >= currentYear - 120; y--) {
      arr.push(y)
    }
    return arr
  }, [currentYear])

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const handleYearSelect = (year: number) => {
    const newDate = setYear(displayMonth, year)
    setDisplayMonth(newDate)
    setViewMode("month")
  }

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = setMonth(displayMonth, monthIndex)
    setDisplayMonth(newDate)
    setViewMode("calendar")
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate)
    if (selectedDate) {
      setIsOpen(false)
    }
  }

  React.useEffect(() => {
    if (date) {
      setDisplayMonth(date)
    }
  }, [date])

  React.useEffect(() => {
    if (!isOpen) {
      setViewMode("calendar")
    }
  }, [isOpen])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-11",
            "bg-background border-border hover:bg-accent/50",
            "transition-all duration-200",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2.5 h-4 w-4 text-muted-foreground" />
          {date ? (
            <span className="text-foreground">
              {format(date, "d 'de' MMMM, yyyy", { locale: es })}
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
          {date && clearable && (
            <X
              className="ml-auto h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                onDateChange(undefined)
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-card border-border shadow-xl rounded-xl overflow-hidden"
        align="start"
      >
        {viewMode === "year" && (
          <div className="p-3">
            <div className="flex items-center justify-between mb-3 px-1">
              <button
                onClick={() => setViewMode("calendar")}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-foreground">Selecciona el año</span>
              <div className="w-7" />
            </div>
            <div className="grid grid-cols-4 gap-1.5 max-h-[280px] overflow-y-auto pr-1">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => handleYearSelect(year)}
                  className={cn(
                    "px-2 py-2 rounded-lg text-sm font-medium transition-all",
                    getYear(displayMonth) === year
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}

        {viewMode === "month" && (
          <div className="p-3">
            <div className="flex items-center justify-between mb-3 px-1">
              <button
                onClick={() => setViewMode("year")}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("year")}
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
              >
                {getYear(displayMonth)}
              </button>
              <div className="w-7" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {months.map((month, index) => (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(index)}
                  className={cn(
                    "px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    getMonth(displayMonth) === index
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  {month.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        )}

        {viewMode === "calendar" && (
          <div>
            <div className="px-4 pt-3 pb-2">
              <button
                type="button"
                onClick={() => setViewMode("year")}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 text-sm font-semibold text-foreground flex items-center justify-center gap-2 transition-all border border-primary/20"
              >
                <CalendarIcon className="w-4 h-4 text-primary" />
                <span className="capitalize">{format(displayMonth, "MMMM yyyy", { locale: es })}</span>
              </button>
            </div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              month={displayMonth}
              onMonthChange={setDisplayMonth}
              initialFocus
              className="rounded-xl pt-0"
              fromYear={currentYear - 120}
              toYear={currentYear}
              hideNavigation
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

interface DateTimePickerProps {
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  clearable?: boolean
}

export function DateTimePicker({
  date,
  onDateChange,
  placeholder = "Seleccionar fecha y hora",
  className,
  disabled = false,
  clearable = true,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const hours = date ? date.getHours().toString().padStart(2, "0") : "09"
  const minutes = date ? date.getMinutes().toString().padStart(2, "0") : "00"

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate)
      if (date) {
        newDate.setHours(date.getHours(), date.getMinutes())
      } else {
        newDate.setHours(9, 0)
      }
      onDateChange(newDate)
    } else {
      onDateChange(undefined)
    }
  }

  const handleTimeChange = (type: "hours" | "minutes", value: string) => {
    const numValue = parseInt(value, 10)
    if (isNaN(numValue)) return

    const newDate = date ? new Date(date) : new Date()
    if (type === "hours") {
      newDate.setHours(Math.min(23, Math.max(0, numValue)))
    } else {
      newDate.setMinutes(Math.min(59, Math.max(0, numValue)))
    }
    onDateChange(newDate)
  }

  const timeOptions = {
    hours: Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0")),
    minutes: ["00", "15", "30", "45"],
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-11",
            "bg-background border-border hover:bg-accent/50",
            "transition-all duration-200",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2.5 h-4 w-4 text-muted-foreground" />
          {date ? (
            <span className="text-foreground">
              {format(date, "d 'de' MMMM, yyyy", { locale: es })}
              <span className="text-muted-foreground mx-1.5">•</span>
              <span className="text-primary font-medium">{format(date, "HH:mm")}</span>
            </span>
          ) : (
            <span>{placeholder}</span>
          )}
          {date && clearable && (
            <X
              className="ml-auto h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                onDateChange(undefined)
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-card border-border shadow-xl rounded-xl"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
          className="rounded-t-xl border-b border-border"
        />
        <div className="p-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Hora</span>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <select
                value={hours}
                onChange={(e) => handleTimeChange("hours", e.target.value)}
                className={cn(
                  "w-16 h-9 rounded-lg border border-border bg-background px-2",
                  "text-sm text-center font-medium text-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20",
                  "transition-all duration-200 cursor-pointer"
                )}
              >
                {timeOptions.hours.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <span className="text-lg font-semibold text-muted-foreground">:</span>
              <select
                value={minutes}
                onChange={(e) => handleTimeChange("minutes", e.target.value)}
                className={cn(
                  "w-16 h-9 rounded-lg border border-border bg-background px-2",
                  "text-sm text-center font-medium text-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20",
                  "transition-all duration-200 cursor-pointer"
                )}
              >
                {timeOptions.minutes.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
