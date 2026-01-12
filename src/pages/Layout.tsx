import type { Child, FC } from "hono/jsx";
import { LanguageToggle } from "../components/LanguageToggle.js";
import { getTranslations, type Locale } from "../i18n.js";

interface LayoutProps {
  children?: Child;
  locale?: Locale;
  currentPath?: string;
  showLanguageToggle?: boolean;
}

export const Layout: FC<LayoutProps> = (props) => {
  const locale = props.locale ?? "en_US";
  const t = getTranslations(locale);
  const showToggle = props.showLanguageToggle !== false;

  return (
    <html lang={locale.replace("_", "-")}>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{t.common.appTitle}</title>
        <script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js"></script>
        <link rel="stylesheet" href="/static/styles.css"></link>
      </head>
      <body>
        {showToggle && props.currentPath && (
          <LanguageToggle locale={locale} currentPath={props.currentPath} />
        )}
        {props.children}
      </body>
    </html>
  );
};
