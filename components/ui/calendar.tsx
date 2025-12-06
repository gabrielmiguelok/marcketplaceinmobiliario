"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  hideNavigation?: boolean
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  hideNavigation = false,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        month_caption: cn(
          "flex justify-center pt-1 relative items-center",
          hideNavigation ? "hidden" : "h-10"
        ),
        caption_label: "text-base font-semibold text-foreground capitalize",
        nav: cn("flex items-center gap-1", hideNavigation && "hidden"),
        button_previous: cn(
          "absolute left-1 h-8 w-8 bg-transparent p-0 opacity-60 hover:opacity-100",
          "inline-flex items-center justify-center rounded-lg",
          "hover:bg-accent hover:text-accent-foreground",
          "transition-all duration-200",
          hideNavigation && "hidden"
        ),
        button_next: cn(
          "absolute right-1 h-8 w-8 bg-transparent p-0 opacity-60 hover:opacity-100",
          "inline-flex items-center justify-center rounded-lg",
          "hover:bg-accent hover:text-accent-foreground",
          "transition-all duration-200",
          hideNavigation && "hidden"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: cn(
          "text-muted-foreground rounded-lg w-10 font-medium text-xs uppercase tracking-wide",
          "flex items-center justify-center h-10"
        ),
        week: "flex w-full mt-1",
        day: cn(
          "relative p-0 text-center focus-within:relative focus-within:z-20",
          "first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg",
          "[&:has([aria-selected].day-range-end)]:rounded-r-lg",
          "[&:has([aria-selected].day-outside)]:bg-accent/50"
        ),
        day_button: cn(
          "h-10 w-10 p-0 font-normal text-sm",
          "inline-flex items-center justify-center rounded-lg",
          "transition-all duration-200",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary/20",
          "aria-selected:opacity-100"
        ),
        range_end: "day-range-end",
        selected: cn(
          "bg-primary text-primary-foreground font-semibold",
          "hover:bg-primary hover:text-primary-foreground",
          "focus:bg-primary focus:text-primary-foreground",
          "shadow-sm"
        ),
        today: cn(
          "bg-accent/80 text-accent-foreground font-semibold",
          "ring-1 ring-primary/20"
        ),
        outside: cn(
          "day-outside text-muted-foreground/50",
          "aria-selected:bg-accent/50 aria-selected:text-muted-foreground"
        ),
        disabled: "text-muted-foreground/30 cursor-not-allowed",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className="h-5 w-5" />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
