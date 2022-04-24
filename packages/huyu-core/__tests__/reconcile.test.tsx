import { render } from "../src/reconcile";
import { _jsx, _jsxFragment } from "../src";
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/dom";

test("should render simple functional component", () => {
  const Hello = () => {
    return <div>hello</div>;
  };

  render(<Hello />, document.body, { forgetInstance: true });

  expect(document.body.innerHTML).toBe("<div>hello</div>");
  document.body.innerHTML = "";
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
  document.body.innerHTML = "";
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

  console.log(target);

  expect(target).toHaveStyle({
    border: "solid 1px black",
    backgroundColor: "azure",
  });
  document.body.innerHTML = "";
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
  document.body.innerHTML = "";
});
