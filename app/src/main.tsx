import { render, Fragment } from "@huyu/core";

/* The old way to generate element and related dom object */

// const hi = createElement("div", {}, "hi");
// const iAm = createElement("div", {}, "I am");
// const headerContainer = createElement("h1", {}, iAm, hi);
// render(headerContainer, document.getElementById("root"));

/* JSX - normal component */

// const test = (
//   <div>
//     <div>test</div>
//   </div>
// );

// render(test, document.getElementById("root"));

/** JSX - named component */

// const Component = (
//   <div>
//     <span>component</span>
//     <div>hi</div>
//   </div>
// );

// render(<Component />, document.getElementById("root"));

/** JSX - function component */

// const Component = () => {
//   return (
//     <div>
//       <span>hihi</span>
//       <span>hi</span>
//     </div>
//   );
// };

// const Container = () => {
//   return (
//     <div>
//       <Component />
//     </div>
//   );
// };

// render(<Container />, document.getElementById("root"));

/** JSX - Fragment */

const Frag = (
  <Fragment>
    <div>hi</div>
    <div>I am array</div>
  </Fragment>
);

console.log(<Frag />);

render(<Frag />, document.getElementById("root"));
