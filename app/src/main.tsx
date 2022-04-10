import { render } from "@huyu/core";
import { createElement } from "@huyu/core";

const hi = createElement("div", {}, ["hi"]);
const iAm = createElement("div", {}, ["I am"]);

const headerContainer = createElement("h1", {}, [iAm, hi]);

const span1 = createElement("span", {}, ["span1"]);
const span2 = createElement("span", {}, ["span2"]);

const spanContainer = createElement("div", {}, [span1, span2]);

const li1 = createElement("li", {}, ["li1"]);
const li2 = createElement("li", {}, ["li2"]);
const li3 = createElement("li", {}, ["li2", span1]);

const ulContainer = createElement("ul", {}, [li1, li2, li3]);

const mainContainer = createElement("div", {}, [
  headerContainer,
  spanContainer,
  ulContainer,
]);

render(mainContainer, document.getElementById("root"));
