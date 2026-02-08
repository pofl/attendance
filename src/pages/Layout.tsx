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
  const currentPath = props.currentPath ?? "";
  const isActive = (path: string): boolean => currentPath === path;

  return (
    <html lang={locale.replace("_", "-")}>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{t.common.appTitle}</title>
        <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js"></script>
        <link rel="stylesheet" href="/static/styles.css"></link>
      </head>
      <body>
        {showToggle && props.currentPath && <LanguageToggle locale={locale} currentPath={props.currentPath} />}
        <nav class="nav">
          <a href="/" class={isActive("/") ? "active" : ""}>
            {t.common.nav.home}
          </a>
          <a href="/cockpit" class={isActive("/cockpit") ? "active" : ""}>
            {t.common.nav.cockpit}
          </a>
          <a href="/flights" class={isActive("/flights") ? "active" : ""}>
            {t.common.nav.flightsOverview}
          </a>
          <a href="/flights/manage" class={isActive("/flights/manage") ? "active" : ""}>
            {t.common.nav.flightsManage}
          </a>
        </nav>
        {props.children}
      </body>
    </html>
  );
};
