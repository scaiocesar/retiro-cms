"use client";

import * as React from "react";
import { formatPhone, PHONE_MASK_PLACEHOLDER } from "@/lib/phone-mask";
import { cn } from "@/lib/utils";

const PhoneInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "type" | "onChange" | "value"> & {
    value: string;
    onChange: (value: string) => void;
  }
>(({ className, value, onChange, disabled, placeholder, ...props }, ref) => {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(formatPhone(e.target.value));
  }

  return (
    <input
      ref={ref}
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      className={cn(
        "flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      placeholder={placeholder ?? PHONE_MASK_PLACEHOLDER}
      maxLength={14}
      {...props}
    />
  );
});
PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
