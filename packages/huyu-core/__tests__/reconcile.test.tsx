import { initializeInstance, render } from "../src/reconcile";
import { _jsx, _jsxFragment } from "../src";
import { fireEvent } from "@testing-library/dom";

/**
 * ToDo:
 * - Simplify test, combine duplicate test together
 */

const cleanup = () => {
  initializeInstance();
  document.body.innerHTML = "";
};

test("should render simple functional component", () => {
  const Hello = () => {
    return <div>hello</div>;
  };

  render(<Hello />, document.body, { forgetInstance: true });

  expect(document.body.innerHTML).toBe("<div>hello</div>");
  cleanup();
});

test("should render function component props - id & class", () => {
  const Button = () => {
    return (
      <button id="test" class="hi-button">
        Click me
      </button>
    );
  };

  render(<Button />, document.body, { forgetInstance: true });

  const target = document.body.querySelector("#test");

  expect(target.id).toBe("test");
  expect(target).toHaveClass("hi-button");
  cleanup();
});

test("should render function component prop - style", () => {
  const Button = () => {
    return (
      <button
        id="test"
        style={{ border: "solid 1px black", backgroundColor: "azure" }}
      >
        Click me
      </button>
    );
  };

  render(<Button />, document.body, { forgetInstance: true });

  const target = document.body.querySelector("#test");

  expect(target).toHaveStyle({
    border: "solid 1px black",
    backgroundColor: "azure",
  });
  cleanup();
});

test("should render function component prop - event", () => {
  const handleClick = jest.fn();
  //const user = userEvent.setup();
  const Button = () => {
    return (
      <button id="test" onClick={() => handleClick()}>
        Click me
      </button>
    );
  };

  render(<Button />, document.body, { forgetInstance: true });
  const target = document.body.querySelector("#test");

  fireEvent(
    target,
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    })
  );

  expect(handleClick).toHaveBeenCalledTimes(1);
  cleanup();
});

test("should do simple reconcile", () => {
  const Div = () => <div>hi</div>;

  render(<Div />, document.body);

  const P = () => <p>hi2</p>;

  render(<P />, document.body);

  expect(document.body.innerHTML).toBe("<p>hi2</p>");
  cleanup();
});

test("should reconcile nested element", () => {
  const Nested = () => (
    <div>
      <div>hi</div>
    </div>
  );

  const Simple = () => <p>hi2</p>;

  render(<Nested />, document.body);
  render(<Simple />, document.body);
  expect(document.body.innerHTML).toBe("<p>hi2</p>");
  cleanup();

  render(<Simple />, document.body);
  render(<Nested />, document.body);
  expect(document.body.innerHTML).toBe("<div><div>hi</div></div>");
  cleanup();
});

test("should render fragment", () => {
  const Test = () => (
    <>
      <div>hi</div>
    </>
  );
  render(<Test />, document.body);
  expect(document.body.innerHTML).toBe("<div>hi</div>");
  cleanup();
});

test("should render complex, nested array", () => {
  const NestedArray = () => {
    return (
      <div>
        {[
          <p>foo</p>,
          <p>bar</p>,
          [
            <p>baaa</p>,
            [
              <p>shit</p>,
              <>
                <p>hi nested</p>
              </>,
            ],
          ],
        ]}
      </div>
    );
  };

  render(<NestedArray />, document.body);
  console.log(document.body.innerHTML);
  expect(document.body.innerHTML).toBe(
    "<div><p>foo</p><p>bar</p><p>baaa</p><p>shit</p><p>hi nested</p></div>"
  );
  cleanup();
});

test("should reconcile complex, nested array with simple component", () => {
  const NestedArray = () => {
    return (
      <div>
        {[
          <p>foo</p>,
          <p>bar</p>,
          [
            <p>baaa</p>,
            [
              <p>shit</p>,
              <>
                <p>hi nested</p>
              </>,
            ],
          ],
        ]}
      </div>
    );
  };

  const Simple = () => <p>hi2</p>;

  render(<NestedArray />, document.body);
  render(<Simple />, document.body);
  expect(document.body.innerHTML).toBe("<p>hi2</p>");
  cleanup();

  render(<Simple />, document.body);
  render(<NestedArray />, document.body);
  expect(document.body.innerHTML).toBe(
    "<div><p>foo</p><p>bar</p><p>baaa</p><p>shit</p><p>hi nested</p></div>"
  );
  cleanup();
});

test("reconcile same tag, should update text", () => {
  const First = () => <p>I am the first one</p>;

  const Second = () => <p>hi2</p>;

  render(<First />, document.body);
  render(<Second />, document.body);
  expect(document.body.innerHTML).toBe("<p>hi2</p>");
  cleanup();
});

test("reconcile same tag, should update style", () => {
  const First = () => (
    <p id="test" style={{ color: "black" }}>
      I am the first one
    </p>
  );

  const Second = () => (
    <p id="test" style={{ color: "white" }}>
      I am the first one
    </p>
  );

  render(<First />, document.body);
  render(<Second />, document.body);

  const target = document.querySelector("#test");

  expect(target).toHaveStyle({
    color: "white",
  });

  cleanup();
});

test("reconcile same tag, should update event", () => {
  const firstHandleClick = jest.fn();

  const First = () => (
    <button id="test" onClick={() => firstHandleClick()}>
      I am the first one
    </button>
  );

  const secondHandleClick = jest.fn();

  const Second = () => (
    <button id="test" onClick={() => secondHandleClick()}>
      I am the second one
    </button>
  );

  render(<First />, document.body);
  render(<Second />, document.body);

  const target = document.body.querySelector("#test");

  fireEvent(
    target,
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    })
  );

  expect(secondHandleClick).toHaveBeenCalledTimes(1);
  cleanup();
});

test("reconcile same tag, should update id", () => {
  const First = () => <p id="test1">I am the first one</p>;

  const Second = () => <p id="test2">I am the first one</p>;

  render(<First />, document.body);
  render(<Second />, document.body);
  const firstTarget = document.querySelector("#test1");
  const secondTarget = document.querySelector("#test2");

  expect(firstTarget).toBeNull();
  expect(secondTarget).toBeTruthy();
  cleanup();
});

test("reconcile same tag, should update class", () => {
  const First = () => <p class="font-normal text-sm">I am the first one</p>;

  const Second = () => <p class="font-normal text-lg">I am the second one</p>;

  render(<First />, document.body);
  render(<Second />, document.body);

  expect(document.body.innerHTML).toBe(
    '<p class="font-normal text-lg">I am the second one</p>'
  );
  cleanup();
});

test("should reconcile complex element with lots of array and switch order", () => {
  const WeirdArray = () => {
    return (
      <>
        {[
          <>
            <h1>hi</h1>
            <>
              <p>yes!</p>
            </>
          </>,
        ]}
      </>
    );
  };

  const NestedArray = () => {
    return (
      <div>
        {[
          <p>foo</p>,
          <p>bar</p>,
          [
            <p>baaa</p>,
            [
              <p>shit</p>,
              <>
                <p>hi nested</p>
              </>,
            ],
          ],
        ]}
      </div>
    );
  };

  const First = () => {
    return (
      <>
        <NestedArray />
        <WeirdArray />
      </>
    );
  };

  const Second = () => {
    return (
      <>
        <WeirdArray />
        <NestedArray />
      </>
    );
  };

  render(<First />, document.body);
  render(<Second />, document.body);

  expect(document.body.innerHTML).toBe(
    "<h1>hi</h1><p>yes!</p><div><p>foo</p><p>bar</p><p>baaa</p><p>shit</p><p>hi nested</p></div>"
  );
});
