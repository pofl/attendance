/* This file is an example. Delete it at will. */

import Layout from "./Layout";

// Cache recipes in memory to avoid unnecessary API calls
const RECIPES = (await (await fetch("https://dummyjson.com/recipes")).json())
  .recipes;

const CUISINES = [...new Set(RECIPES.map(({ cuisine }) => cuisine))].toSorted();

/**
 * @this {import("./types").ThisContext}
 * @param {import("./types").RouteProps} props
 */
export default async function ({ request, reply }) {
  const $cuisine = request.query["cuisine"] || "";

  return (
    <Layout
      title={`${$cuisine} Recipes`.trim()}
      description={`Have fun cooking ${$cuisine.toLowerCase()} recipes`}
    >
      <main>
        <h1>{$cuisine} Recipes</h1>
        <p>Here you will find some exciting recipes to cook at home.</p>
        <div class="row wrap">
          <div class="col">
            {CUISINES.map((cuisine) => (
              <>
                <a
                  href={cuisine !== $cuisine ? `?cuisine=${cuisine}` : ""}
                  class={{ active: cuisine === $cuisine }}
                >
                  {cuisine}
                </a>{" "}
              </>
            ))}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Cuisine</th>
              <th>Difficulty</th>
              <th>Minutes</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {RECIPES.filter(
              ({ cuisine }) => !$cuisine || $cuisine === cuisine
            ).map(
              ({
                id,
                name,
                cuisine,
                difficulty,
                image,
                prepTimeMinutes,
                cookTimeMinutes,
              }) => (
                <tr>
                  <td>
                    <a href={`${id}-${slugify(name)}`}>{name}</a>
                  </td>
                  <td>{cuisine}</td>
                  <td>{difficulty}</td>
                  <td>{prepTimeMinutes + cookTimeMinutes} min</td>
                  <td>
                    <img src={image} height="50" width="50" loading="lazy" />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </main>
    </Layout>
  );
}

/**
 * @param {string} str
 */
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
