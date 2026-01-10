/* This file is an example. Delete it at will. */

document.querySelectorAll("[data-clipboard]").forEach((el) => {
  el.addEventListener("click", () => {
    navigator.clipboard.writeText(el.getAttribute("data-clipboard"));
  });
});
