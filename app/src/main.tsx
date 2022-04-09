import { render } from "@huyu/core";
import { createElement } from "@huyu/core";

const vNode = createElement("div", {}, []);
render(vNode, document.getElementById("root"));
