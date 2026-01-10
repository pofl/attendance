/* This file is an example. Delete it at will. */

/**
 * @param {import("./types").RouteProps} props
 */
export default function ({ request, reply }) {
  // Provide request/reply via this context.
  this.request = request;
  this.reply = reply;

  // Set optional response handler in request context.
  // Below is an example of how to gzip the resulting payload.
  /*
  import { promisify } from "node:util";
  import { gzip } from "node:zlib";
  
  this.responseHandler = (payload) => {
    if (
      typeof payload === "string" &&
      request.headers["accept-encoding"]?.includes("gzip")
    ) {
      reply.header("content-encoding", "gzip");
      return promisify(gzip)(payload);
    } else {
      return payload;
    }
  };
  */

  // Set optional error handler to provide user friendly error pages.
  // Default http response status is 500,
  // you can override it with this.reply.status(...).
  /*
  this.errorHandler = async (error) => {
    // You can decide if you want to create a log entry.
    // console.error("❌", error);
    return (
      <Layout title="Internal Server Error">
        <h1>Internal Server Error</h1>
        <p>
          We're sorry, but something went wrong with your request. Please try
          again later. <code>{error.toString()}</code>
        </p>
      </Layout>
    );
  };
  */

  // You can override #jsxToString() via 'this' context.
  // This allows you to modify or replace JSX components.
  // See example in <https://github.com/jeasx/jsx-async-runtime>
  /*  
    import { jsxToString } from "jsx-async-runtime";
    ...
    this.jsxToString = (jsxElement) => {
      console.log(JSON.stringify(jsxElement, null, 2));
      return jsxToString.call(this, jsxElement)
    }
  */
}
