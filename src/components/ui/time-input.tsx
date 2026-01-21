import * as React from "react";
import { cn } from "@/lib/utils";

interface TimeInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  ({ className, value, onChange, placeholder = "00:00", ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let input = e.target.value;
      
      // Remove non-digit characters except colon
      input = input.replace(/[^\d:]/g, '');
      
      // Remove existing colons for processing
      const digitsOnly = input.replace(/:/g, '');
      
      // Limit to 4 digits
      const truncated = digitsOnly.slice(0, 4);
      
      // Format with colon
      let formatted = truncated;
      if (truncated.length >= 3) {
        formatted = `${truncated.slice(0, 2)}:${truncated.slice(2)}`;
      } else if (truncated.length === 2 && input.includes(':')) {
        // User typed 2 digits and then a colon
        formatted = `${truncated}:`;
      }
      
      onChange(formatted);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow navigation keys
      if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
        return;
      }
      
      // Allow only digits and colon
      if (!/[\d:]/.test(e.key)) {
        e.preventDefault();
      }
    };

    return (
      <input
        type="text"
        inputMode="numeric"
        ref={ref}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "px-2 md:px-4 py-2 md:py-3 text-[14px] md:text-[17px] text-black text-center focus:outline-none placeholder:text-[#C4C4C4]",
          className
        )}
        {...props}
      />
    );
  }
);

TimeInput.displayName = "TimeInput";

export { TimeInput };
