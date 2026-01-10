/* This file is an example. Delete it at will. */

import Layout from "./Layout";

/**
 * @param {import("./types").RouteProps} props
 */
export default function ({}) {
  return (
    <Layout
      title="404 - Resource Not Found"
      description="The resource you requested has not been found at the specified
    address."
    >
      <main>
        <h1>404 - Resource Not Found</h1>
        <p>
          The resource you requested has not been found at the specified
          address.
        </p>
        <a href="/">Go to homepage</a>
      </main>
    </Layout>
  );
}
