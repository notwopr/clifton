"use client";

import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface TagInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  label?: string;
}

export function TagInput({ values, onChange, placeholder, label }: TagInputProps) {
  const [draft, setDraft] = useState("");

  function add() {
    const trimmed = draft.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setDraft("");
  }

  function remove(idx: number) {
    onChange(values.filter((_, i) => i !== idx));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    }
    if (e.key === "Backspace" && !draft && values.length > 0) {
      remove(values.length - 1);
    }
  }

  return (
    <div className="space-y-2">
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
      <div className="flex flex-wrap gap-1.5 p-2 border rounded-md bg-background min-h-[42px]">
        {values.map((v, i) => (
          <Badge key={i} variant="secondary" className="gap-1 text-xs">
            {v}
            <button
              type="button"
              onClick={() => remove(i)}
              className="hover:text-destructive ml-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={add}
          placeholder={values.length === 0 ? placeholder : "Add another…"}
          className="border-0 shadow-none focus-visible:ring-0 h-6 px-0 text-sm flex-1 min-w-[120px]"
        />
      </div>
      <p className="text-xs text-muted-foreground">Press Enter or comma to add</p>
    </div>
  );
}
