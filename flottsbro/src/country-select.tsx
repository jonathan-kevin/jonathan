import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { countryCode, countryFlag, countryOptions, type CountryOption } from "./countries";

type Props = {
  value: string;
  language: "sv" | "en";
  onChange: (value: string) => void;
};

const normalize = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase();

export function CountrySelect({ value, language, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const selectedCode = countryCode(value);
  const selected = countryOptions.find((item) => item.code === selectedCode);
  const sorted = [...countryOptions].sort((a, b) => a[language].localeCompare(b[language], language));
  const matches = sorted.filter((item) =>
    !query || normalize(`${item.sv} ${item.en} ${item.code}`).includes(normalize(query)),
  );
  const options = !query && selected
    ? [selected, ...matches.filter((item) => item.code !== selected.code)]
    : matches;

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);
  useEffect(() => {
    if (open) listRef.current?.querySelectorAll('[role="option"]')[active]?.scrollIntoView({ block: "nearest" });
  }, [active, open, query]);
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  const choose = (option: CountryOption) => {
    onChange(option.sv);
    setOpen(false);
    setQuery("");
    setActive(0);
    triggerRef.current?.focus();
  };

  return (
    <div className="flow-country-field" ref={rootRef}>
      <span id={`${id}-label`}>{language === "en" ? "Country" : "Land"}</span>
      <button
        ref={triggerRef}
        type="button"
        className="flow-country-trigger"
        aria-labelledby={`${id}-label ${id}-value`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        onClick={() => {
          setQuery("");
          setActive(0);
          setOpen((current) => !current);
        }}
      >
        <span id={`${id}-value`}>
          {selected && <span className="flow-country-flag" aria-hidden="true">{countryFlag(selected.code)}</span>}
          {selected?.[language] || value || (language === "en" ? "Choose country" : "Välj land")}
        </span>
        <ChevronDown size={17} aria-hidden="true" />
      </button>
      {open && (
        <div className="flow-country-popover">
          <div className="flow-country-search">
            <Search size={17} aria-hidden="true" />
            <input
              ref={searchRef}
              role="combobox"
              aria-label={language === "en" ? "Search country" : "Sök land"}
              aria-autocomplete="list"
              aria-expanded="true"
              aria-controls={`${id}-list`}
              aria-activedescendant={options[active] ? `${id}-${options[active].code}` : undefined}
              placeholder={language === "en" ? "Search country" : "Sök land"}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setOpen(false);
                  triggerRef.current?.focus();
                  return;
                }
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  event.preventDefault();
                  setActive((current) => Math.max(0, Math.min(options.length - 1, current + (event.key === "ArrowDown" ? 1 : -1))));
                }
                if (event.key === "Enter" && options[active]) {
                  event.preventDefault();
                  choose(options[active]);
                }
              }}
            />
            {query && <button type="button" aria-label={language === "en" ? "Clear search" : "Rensa sökning"} onClick={() => { setQuery(""); setActive(0); searchRef.current?.focus(); }}><X size={16} /></button>}
          </div>
          <div className="flow-country-list" ref={listRef} id={`${id}-list`} role="listbox" aria-label={language === "en" ? "Countries" : "Länder"}>
            {options.length ? options.map((option, index) => (
              <button
                type="button"
                role="option"
                id={`${id}-${option.code}`}
                aria-selected={option.code === selectedCode}
                className={index === active ? "active" : ""}
                key={option.code}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(option)}
              >
                <span className="flow-country-flag" aria-hidden="true">{countryFlag(option.code)}</span>
                <span>{option[language]}</span>
                {option.code === selectedCode && <Check size={16} aria-hidden="true" />}
              </button>
            )) : <p>{language === "en" ? "No countries found" : "Inga länder hittades"}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
