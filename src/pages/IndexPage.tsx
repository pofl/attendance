import type { FC } from "hono/jsx";
import { getTranslations, type Locale } from "../i18n.js";
import { Layout } from "./Layout.js";

export const IndexPage: FC<{ locale: Locale }> = ({ locale }) => {
  const t = getTranslations(locale);
  return (
    <Layout locale={locale} currentPath="/">
      <h1>{t.indexPage.title}</h1>
      <form action="/attendee" method="post" class="card">
        <label>
          {t.indexPage.enterName}:
          <input type="text" name="name" placeholder={t.indexPage.namePlaceholder} required autofocus />
        </label>
        <button type="submit">{t.indexPage.go}</button>
      </form>
    </Layout>
  );
};
