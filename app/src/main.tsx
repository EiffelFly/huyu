import { render, createElement, h } from "@huyu/core";

/* The old way to generate element and related dom object */

// const hi = createElement("div", {}, "hi");
// const iAm = createElement("div", {}, "I am");
// const headerContainer = createElement("h1", {}, iAm, hi);
// render(headerContainer, document.getElementById("root"));

/* the jsx way */

const test = <div>test</div>;

render(test, document.getElementById("root"));
