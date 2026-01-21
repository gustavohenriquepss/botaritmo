import * as React from "react";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type MobileDatePickerProps = {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  onClear: () => void;
  className?: string;
};

export function MobileDatePicker({
  date,
  onSelect,
  onClear,
  className,
}: MobileDatePickerProps) {
  return (
    <div className={cn("lg:hidden mb-6", className)}>
      <div className="flex gap-0">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="relative overflow-hidden bg-white text-black h-[34px] px-3 flex items-center text-[11px] font-medium uppercase border border-black leading-none group"
            >
              <CalendarIcon className="mr-2 h-3 w-3 relative z-10" />
              <span className="relative z-10">
                {date ? format(date, "d 'de' MMMM", { locale: ptBR }).toUpperCase() : "FILTRAR POR DATA"}
              </span>
              <span className="absolute inset-0 bg-brand translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50 bg-white border border-black" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onSelect}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        {date && (
          <button
            onClick={onClear}
            className="relative overflow-hidden bg-white text-black h-[34px] px-3 flex items-center text-[11px] font-medium uppercase border border-l-0 border-black leading-none group"
          >
            <span className="relative z-10">LIMPAR</span>
            <span className="absolute inset-0 bg-brand translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
          </button>
        )}
      </div>
    </div>
  );
}
