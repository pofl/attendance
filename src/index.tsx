import { serve } from "@hono/node-server";
import { Hono } from "hono";
import type { FC } from "hono/jsx";

const app = new Hono();

const Layout: FC = (props) => {
  return (
    <html>
      <head>
         <script src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js"></script>
      </head>
      <body>{props.children}</body>
    </html>
  );
};

const Top: FC<{ messages: string[] }> = (props) => {
  return (
    <Layout>
      <h1>Hello Hono!</h1>
      <ul>
        {props.messages.map((message) => {
          return <li>{message}!!</li>;
        })}
      </ul>
      <button hx-get="/hello" hx-target="body" hx-swap="afterend">Load</button>
    </Layout>
  );
};

app.get("/", (c) => {
  const messages = ["Good Morning", "Good Evening", "Good Night"];
  return c.html(<Top messages={messages} />);
});

app.get("/hello", (c) => {
  return c.html(<p>"Hello Hono!"</p>);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
