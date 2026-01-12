import type { FC } from "hono/jsx";
import { Layout } from "./Layout.js";

export const IndexPage: FC<{ messages: string[] }> = (props) => {
  return (
    <Layout>
      <h1>Hello Hono!</h1>
      <ul>
        {props.messages.map((message) => {
          return <li>{message}!!</li>;
        })}
      </ul>
      <button hx-get="/hello" hx-swap="afterend">
        Load
      </button>
      <div hx-get="/part/attendee/Florian" hx-trigger="load" hx-swap="innerHTML">
        Florian
      </div>
    </Layout>
  );
};
