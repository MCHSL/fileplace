import React, { useEffect, useRef } from "react";
import { useState } from "react";

interface InlineInputProps {
  editing: boolean;
  setEditing: (editing: boolean) => void;
  initialValue: string;
  placeholder?: string;
  selection?: [number, number];
  onConfirm: (value: string) => void;
  onCancel?: () => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  children?: React.ReactNode;
}

const InlineInput = ({
  editing,
  setEditing,
  initialValue,
  selection,
  placeholder,
  onConfirm,
  onCancel,
  inputProps,
  children,
}: InlineInputProps) => {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  const stopEditing = (reset: boolean) => {
    setEditing(false);
    if (reset) setValue(initialValue);
  };

  useEffect(() => {
    if (editing) {
      const input = inputRef.current;
      if (input) {
        input.focus();
        if (selection) {
          input.setSelectionRange(selection[0], selection[1]);
        }
      }
    }
  }, [editing, selection]);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onConfirm(value);
      stopEditing(true);
    } else if (e.key === "Escape") {
      if (onCancel) onCancel();
      stopEditing(true);
    }
  };

  return editing ? (
    <input
      type="text"
      ref={inputRef}
      value={value}
      onKeyDown={handleKeyDown}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => stopEditing(true)}
      placeholder={placeholder}
      {...inputProps}
    />
  ) : (
    <>{children}</>
  );
};

export default InlineInput;
