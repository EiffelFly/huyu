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

// const Frag = (
//   <Fragment>
//     <div>hi</div>
//     <div>I am array</div>
//   </Fragment>
// );

// console.log(<Frag />);

// render(<Frag />, document.getElementById("root"));

/** JSX - Array children */

// const Foo = (
//   <div>
//     {[0, 1].map((e) => (
//       <p>{`hi-${e}`}</p>
//     ))}
//   </div>
// );

// render(Foo, document.getElementById("root"));

/** JSX - Named function component wrap children */

// const Foo = (props) => {
//   return <div>{props.children}</div>;
// };

// const Bar = (
//   <Foo>
//     <div>hi</div>
//     <div>I am bar</div>
//   </Foo>
// );

// render(<Bar />, document.getElementById("root"));

/** JSX style */

// const Foo = () => {
//   return <div style={{ color: "blue" }}>hi</div>;
// };

// console.log(Foo, <Foo />);

// render(<Foo />, document.getElementById("root"));

/** JSX - style and event */

const Bar = () => {
  return (
    <button
      key="bar"
      className="hi"
      aria-label="foo"
      disabled={true}
      style={{
        width: "100px",
        display: "flex",
        padding: "12px",
        backgroundColor: "grey",
        color: "white",
      }}
    >
      <p
        onClick={() => {
          console.log("hello");
        }}
        aria-hidden={true}
        style={{ margin: "0 auto", color: "honeydew" }}
      >
        Click me
      </p>
    </button>
  );
};

render(<Bar />, document.getElementById("root"));

// const Bar = () => {
//   return (
//     <>
//       <>
//         <div>hi</div>
//         <div>Oya</div>
//       </>
//       <>
//         {[0, 1, 2, 3].map((e) => (
//           <div>
//             {[0, 1].map((e) => (
//               <p>{`women-${e}`}</p>
//             ))}
//           </div>
//         ))}
//       </>
//     </>
//   );
// };

// const Foo = () => {
//   return (
//     <>
//       <Bar />
//     </>
//   );
// };

// render(<Foo />, document.getElementById("root"));
