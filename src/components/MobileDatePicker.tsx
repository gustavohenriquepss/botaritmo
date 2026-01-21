import * as React from "react";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "d 'de' MMMM", { locale: ptBR }) : "Filtrar por data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
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
          <Button variant="ghost" onClick={onClear}>
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}
