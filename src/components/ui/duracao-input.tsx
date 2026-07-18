"use client";

import * as React from "react";
import {
  DURACAO_MASK_PLACEHOLDER,
  formatDuracaoMask,
} from "@/lib/planejamento/horarios";
import { cn } from "@/lib/utils";

const DuracaoInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "type" | "onChange" | "value"> & {
    value: string;
    onChange: (value: string) => void;
  }
>(({ className, value, onChange, disabled, placeholder, ...props }, ref) => {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(formatDuracaoMask(e.target.value));
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text/plain");
    if (!pasted) return;
    e.preventDefault();
    onChange(formatDuracaoMask(pasted));
  }

  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      className={cn(
        "flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      value={value}
      onChange={handleChange}
      onPaste={handlePaste}
      disabled={disabled}
      placeholder={placeholder ?? DURACAO_MASK_PLACEHOLDER}
      {...props}
    />
  );
});
DuracaoInput.displayName = "DuracaoInput";

export { DuracaoInput };
