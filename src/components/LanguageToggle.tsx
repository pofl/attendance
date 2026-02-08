import type { FC } from "hono/jsx";
import type { Locale } from "../i18n.js";

export const LanguageToggle: FC<{ locale: Locale; currentPath: string }> = ({ locale, currentPath }) => {
  return (
    <form class="language-toggle" hx-post="/set-locale">
      <input type="hidden" name="redirect" value={currentPath} />
      <select name="locale" class="language-select" onchange="this.form.submit()">
        <option value="en_US" selected={locale === "en_US"}>
          🇺🇸 English
        </option>
        <option value="de_DE" selected={locale === "de_DE"}>
          🇩🇪 Deutsch
        </option>
      </select>
    </form>
  );
};
