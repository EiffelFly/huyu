import { render } from "../src/reconcile";
import { _jsx, _jsxFragment } from "../src";

test("should render simple functional component", () => {
  const Hello = () => {
    return <div>hello</div>;
  };

  const ownerDom = document.createElement("div");

  render(<Hello />, ownerDom);

  expect(ownerDom.innerHTML).toBe("<div>hello</div>");
});
