import { LANE } from "./reconcile";
import { Attributes } from "./type";
import { IFiber } from "./type";

export const createDomElement = <P = Attributes>(fiber: IFiber) => {
  const dom =
    fiber.type === "#text"
      ? document.createTextNode("")
      : fiber.lane & LANE.SVG
      ? document.createElementNS(
          "http://www.w3.org/2000/svg",
          fiber.type as string
        )
      : document.createElement(fiber.type as string);
};
