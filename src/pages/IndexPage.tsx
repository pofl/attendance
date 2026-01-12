import type { FC } from "hono/jsx";
import { Layout } from "./Layout.js";

export const IndexPage: FC = () => {
  return (
    <Layout>
      <h1>Attendance</h1>
      <form action="/attendee" method="post">
        <label>
          Enter attendee name:
          <input type="text" name="name" placeholder="Name" required autofocus />
        </label>
        <button type="submit">Go</button>
      </form>
    </Layout>
  );
};
