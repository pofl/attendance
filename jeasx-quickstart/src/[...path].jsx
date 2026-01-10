/* This file is an example. Delete it at will. */

import Layout from "./Layout";

/**
 * @this {import("./types").ThisContext}
 * @param {import("./types").RouteProps} props
 */
export default async function ({ request, reply }) {
  const [id] = request.path.split("-", 1);
  const response = await fetch(`https://dummyjson.com/recipes${id}`);

  if (!response.ok) {
    reply.status(404);
    return;
  }

  const { name, ingredients, instructions, image, difficulty, cuisine } =
    await response.json();

  return (
    <Layout title={name} description={`${name} - ${cuisine} - ${difficulty} `}>
      <main>
        <a href="/" onclick="history.back(); return false;">
          &laquo; Back
        </a>
        <article>
          <h1>{name}</h1>
          <p>
            {cuisine} / {difficulty}
          </p>
          <div class="row">
            <div class="col">
              <img src={image} alt={name} width="400" />
            </div>
            <div class="col">
              <h2>Ingredients</h2>
              <ul>
                {ingredients.map((ingredient) => (
                  <li>{ingredient}</li>
                ))}
              </ul>
              <button type="button" data-clipboard={ingredients.join("\n")}>
                Copy to clipboard
              </button>
            </div>
          </div>
          <h2>Instructions</h2>
          <ol>
            {instructions.map((instruction) => (
              <li>{instruction}</li>
            ))}
          </ol>
        </article>
      </main>
    </Layout>
  );
}
