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

const Button = () => {
  return (
    <button
      key="button"
      className="hi"
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
        Click mes
      </p>
    </button>
  );
};

const InputField = () => {
  return (
    <input
      key="input-field-a"
      type="text"
      style={{ border: "1px solid black", marginBottom: "20px" }}
    />
  );
};

const Text = () => {
  return (
    <div>
      <InputField />
      <Button />
    </div>
  );
};

console.log(<Text />);

const Container = () => {
  return (
    <>
      <div style={{ marginBottom: "20px" }}>
        <h1>hi, this is huyu</h1>
      </div>
      <div>
        <InputField />
        <Button />
      </div>
      <>
        {[0, 1, 2, 3].map((e) => (
          <div>
            {[0, 1].map((e) => (
              <p>{`hi-${e}`}</p>
            ))}
          </div>
        ))}
      </>
    </>
  );
};

render(<Text />, document.getElementById("root"));
