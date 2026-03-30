import { useMemo, useRef, useState } from "react";
import type { Employer } from "@/domain/employer";

export function EmployerAutocomplete({
  employers,
  value,
  onChange,
  onPickEmployer,
  disabled,
  id,
  placeholder = "Type or pick employer name",
}: {
  employers: Employer[];
  value: string;
  onChange: (name: string) => void;
  onPickEmployer?: (employerId: string, name: string) => void;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return employers.slice(0, 8);
    return employers
      .filter((e) => e.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [employers, value]);

  function pick(e: Employer) {
    onChange(e.name);
    onPickEmployer?.(e.id, e.name);
    setOpen(false);
  }

  return (
    <div className="employer-autocomplete">
      <input
        id={id}
        className="field-input"
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(ev) => {
          onChange(ev.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = setTimeout(() => setOpen(false), 150);
        }}
      />
      {open && suggestions.length > 0 ? (
        <ul className="employer-autocomplete__list" role="listbox">
          {suggestions.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                className="employer-autocomplete__opt"
                onMouseDown={(ev) => {
                  ev.preventDefault();
                  pick(e);
                }}
              >
                {e.name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
