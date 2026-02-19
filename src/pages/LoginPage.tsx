import type { FC } from "hono/jsx";
import { getTranslations, type Locale } from "../i18n.js";

interface LoginPageProps {
  locale: Locale;
  error?: string;
}

export const LoginPage: FC<LoginPageProps> = ({ locale, error }) => {
  const t = getTranslations(locale);
  return (
    <html lang={locale.replace("_", "-")}>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>
          {t.common.appTitle} – {t.loginPage.title}
        </title>
        <link rel="stylesheet" href="/static/styles.css"></link>
      </head>
      <body>
        <h1>{t.loginPage.title}</h1>
        {error && <p class="error">{error}</p>}
        <form class="card" method="post" action="/login">
          <label>
            {t.loginPage.username}:
            <input type="text" name="username" placeholder={t.loginPage.usernamePlaceholder} required autofocus />
          </label>
          <label>
            {t.loginPage.password}:
            <input type="password" name="password" placeholder={t.loginPage.passwordPlaceholder} required />
          </label>
          <button type="submit">{t.loginPage.submit}</button>
        </form>
      </body>
    </html>
  );
};
