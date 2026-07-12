"use client";

import { ChangeEvent } from "react";
import { formatCurrencyDisplay, parseCurrencyDisplay } from "@/lib/currencyInput";

interface CurrencyInputProps {
  value: string;
  onChange: (display: string, numeric: number) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export default function CurrencyInput({ value, onChange, placeholder, className, autoFocus }: CurrencyInputProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const formatted = formatCurrencyDisplay(e.target.value);
    onChange(formatted, parseCurrencyDisplay(formatted));
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      autoFocus={autoFocus}
    />
  );
}