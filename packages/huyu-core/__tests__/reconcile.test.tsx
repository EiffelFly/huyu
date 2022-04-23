import { render } from "../src/reconcile";
import { _jsx, _jsxFragment } from "../src";

test("should render simple functional component", () => {
  const Hello = () => {
    return <div>hello</div>;
  };

  render(<Hello />, document.body);

  expect(document.body.innerHTML).toBe("<div>hello</div>");
});

test("should render function component props", () => {
  const Button = () => {
    return (
      <button id="test" class="hi-button">
        Click me
      </button>
    );
  };

  render(<Button />, document.body);

  const target = document.body.querySelector("#test");

  expect(target.id).toBe("test");
  expect(target).toHaveClass("hi-button");
});
