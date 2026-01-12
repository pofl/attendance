import type { FC } from "hono/jsx";

export const Layout: FC = (props) => {
  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Attendance</title>
        <script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js"></script>
        <link rel="stylesheet" href="/static/styles.css"></link>
      </head>
      <body>{props.children}</body>
    </html>
  );
};
