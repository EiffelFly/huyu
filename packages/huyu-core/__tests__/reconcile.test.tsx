import { initializeInstance, render } from "../src/reconcile";
import { _jsx, _jsxFragment  } from "../src";
import { fireEvent } from "@testing-library/dom";

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
