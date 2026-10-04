import * as countries from "i18n-iso-countries";
import swedish from "i18n-iso-countries/langs/sv.json";
import english from "i18n-iso-countries/langs/en.json";

countries.registerLocale(swedish);
countries.registerLocale(english);

export type CountryOption = {
  code: string;
  sv: string;
  en: string;
};

export const countryOptions: CountryOption[] = Object.entries(countries.getNames("sv"))
  .map(([code, sv]) => ({
    code,
    sv,
    en: countries.getName(code, "en") ?? sv,
  }));

export const countryCode = (value: string | undefined) => {
  const name = value?.trim() ?? "";
  if (!name) return "";
  if (/^[A-Za-z]{2}$/.test(name) && countries.isValid(name.toUpperCase()))
    return name.toUpperCase();
  return countries.getAlpha2Code(name, "sv") || countries.getAlpha2Code(name, "en") || "";
};

export const countryLabel = (value: string | undefined, language: "sv" | "en") => {
  const code = countryCode(value);
  return code ? countries.getName(code, language) ?? value ?? "" : value ?? "";
};
