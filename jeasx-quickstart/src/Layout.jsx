/* This file is an example. Delete it at will. */

/**
 * @this {import("./types").ThisContext}
 */
export default function Layout({
  title = "",
  description = "",
  children = undefined,
}) {
  const path = this.request.path;

  return (
    <>
      {{ html: "<!DOCTYPE html>" }}
      <html lang="en">
        <head>
          <base href={`${path.endsWith("/") ? path : path + "/"}`} />
          <meta charset="utf-8" />
          <meta name="description" content={description} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link
            rel="stylesheet"
            href={`/index.css?${process.env.BUILD_TIME}`}
          />
          <script type="module" src={`/index.js?${process.env.BUILD_TIME}`} />
          <title>{title}</title>
        </head>
        <body>
          {children}
          <footer>
            <hr />
            <h5>Jeasx - Quickstart</h5>
            <p>
              Explore this sample application to quickly get started with Jeasx.
              Visit the <a href="https://www.jeasx.dev">Jeasx website</a> to
              learn more about the framework.
            </p>
          </footer>
        </body>
      </html>
    </>
  );
}
