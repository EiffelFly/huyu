import { SVG_ELEMENT, TEXT_ELEMENT } from "./constant";
import { createVDom } from "./create-element";
import { DOM, FC, HuyuElement, HuyuInstance, VDom, VNode } from "./type";

let rootInstance = null;

export const render = (huyuElement: HuyuElement, ownerDom: DOM | null) => {
  let vDom;
  if (huyuElement) {
    vDom = createVDom(huyuElement);
  }
  console.log("root-instance", rootInstance);
  const newInstance = reconcilie(ownerDom, rootInstance, vDom ? vDom : null);
  rootInstance = newInstance;
};

const reconcilie = (
  ownerDom: Node | DOM | null,
  currentInstance: HuyuInstance,
  nextVDom: VDom
) => {
  console.log("reconcile begin", ownerDom, currentInstance, nextVDom);

  if (!currentInstance) {
    /** We need to create a new instance */
    console.log("create brand new instance");

    const dom = createDom(nextVDom, null);
    let newChildrenInstance = [];

    if (Array.isArray(dom)) {
      for (let i = 0; i < dom.length; i++) {
        newChildrenInstance.push({
          dom: dom[i].childNodes,
          vDom: nextVDom[i].props.children,
          childrenInstance: null,
        });
        ownerDom.appendChild(dom[i]);
      }
    } else {
      newChildrenInstance.push({
        dom: dom.childNodes,
        vDom: (nextVDom as VNode).props.children,
        childrenInstance: null,
      });
      ownerDom.appendChild(dom);
    }

    return {
      dom,
      vDom: nextVDom,
      childrenInstance: newChildrenInstance,
    };
  } else if (!nextVDom) {
    /** If next vDom is null we have to remove the dom */
    console.log("remove instance");

    if (Array.isArray(currentInstance.dom)) {
      for (const node of currentInstance.dom) {
        ownerDom.removeChild(node);
      }
    } else {
      ownerDom.removeChild(currentInstance.dom);
    }

    return {
      dom: null,
      vDom: nextVDom,
      childrenInstance: null,
    };
  } else if (Array.isArray(nextVDom)) {
    /** Our vDom can be a array, we need to compare every type of the item in the array and
     * reconcile their children
     */

    if (
      Array.isArray(currentInstance.dom) ||
      currentInstance.dom instanceof NodeList
    ) {
      console.log("many-to-many", currentInstance.dom, nextVDom);

      let index = 0;
      let newDom = [];
      let newChildrenInstance = [];

      const maxIndex = Math.max(currentInstance.dom.length, nextVDom.length);

      while (index < maxIndex) {
        if (!currentInstance.vDom[index] && nextVDom[index]) {
          const dom = createDom(nextVDom[index], null);
          ownerDom.appendChild(dom);
          newDom.push(dom);
          index++;
          newChildrenInstance.push({
            dom: dom.childNodes,
            vDom: nextVDom[index].props.children,
            childrenInstance: null,
          });
          continue;
        }

        if (currentInstance.vDom[index] && !nextVDom[index]) {
          ownerDom.removeChild(currentInstance.dom[index]);
          index++;
          continue;
        }

        if (currentInstance.vDom[index].type !== nextVDom[index].type) {
          const dom = createDom(nextVDom[index], null);
          ownerDom.replaceChild(dom, currentInstance.dom[index]);
          newDom.push(dom);
          index++;
          newChildrenInstance.push({
            dom: dom.childNodes,
            vDom: nextVDom[index].props.children,
            childrenInstance: null,
          });
        } else {
          console.log("reconcile children", currentInstance);
          const newChildrenInstance = reconcilie(
            currentInstance.dom[index],
            currentInstance.childrenInstance[index],
            nextVDom[index].props.children
          );

          console.log(currentInstance.dom, newChildrenInstance);

          newChildrenInstance.push({
            dom: currentInstance.dom[index],
            vDom: nextVDom[index].props.children,
            childrenInstance: newChildrenInstance,
          });

          index++;
        }
      }
    } else {
      console.log("one-to-many");

      let newDom = [];
      let index = 0;
      let newChildrenInstance = [];

      ownerDom.removeChild(currentInstance.dom);

      while (index < nextVDom.length) {
        const dom = createDom(nextVDom[index], null);
        newDom.push(dom);
        newChildrenInstance.push({
          dom: dom.childNodes,
          vDom: nextVDom[index].props.children,
          childrenInstance: null,
        });
        ownerDom.appendChild(dom);
        index++;
      }

      return {
        dom: newDom,
        vDom: nextVDom,
        childrenInstance: newChildrenInstance,
      };
    }
  } else {
    if (
      Array.isArray(currentInstance.dom) ||
      currentInstance.dom instanceof NodeList
    ) {
      console.log("many-to-one", currentInstance, nextVDom);

      let index = 0;
      /** Remove old dom */
      while (index < currentInstance.dom.length) {
        ownerDom.removeChild(currentInstance.dom[index]);
        index++;
      }

      const dom = createDom(nextVDom, null);
      ownerDom.appendChild(dom);
      return {
        dom,
        vDom: nextVDom,
        childrenInstance: [
          {
            dom: dom.childNodes,
            vDom: nextVDom.props.children,
            childrenInstance: null,
          },
        ],
      };
    } else {
      if ((currentInstance.vDom as VNode).type === nextVDom.type) {
        console.log("one-to-one same-type", currentInstance);
        // const newChildrenInstance = reconcilieChildren(
        //   currentInstance.dom,
        //   currentInstance.childrenInstance[0] || [],
        //   nextVDom.props.children || []
        // );

        const newChildrenInstance = reconcilie(
          currentInstance.dom,
          currentInstance.childrenInstance[0],
          nextVDom.props.children
        );

        console.log(currentInstance.dom, newChildrenInstance);

        return {
          dom: currentInstance.dom,
          vDom: nextVDom,
          childInstance: newChildrenInstance,
        };
      } else {
        console.log("one-to-one different-type reconcile");
        const dom = createDom(nextVDom, null);

        console.log(dom, currentInstance);

        ownerDom.replaceChild(dom, currentInstance.dom);
        return {
          dom,
          vDom: nextVDom,
          childrenInstance: [
            {
              dom: dom.childNodes,
              vDom: nextVDom.props.children,
              childrenInstance: null,
            },
          ],
        };
      }
    }
  }
};

const reconcilieChildren = (
  ownerDom: Node | DOM | null,
  childInstance: HuyuInstance,
  childNextVDom: VNode[]
) => {
  let index = 0;
  let newChildrenInstance = [];

  // while (index < maxLength) {
  //   const newInstance = reconcilie(
  //     ownerDom,
  //     childInstance[index],
  //     childNextVDom[index]
  //   );
  //   newChildrenInstance.push(newInstance);
  //   index++;
  // }

  const newInstance = reconcilie(ownerDom, childInstance, childNextVDom);

  return newChildrenInstance;
};

// const createInstance = (vDom: VDom, ownerDom: DOM | null): HuyuInstance => {
//   const dom = createDom(vDom, null);
//   return {
//     dom,
//     vDom,
//   };
// };

// export const reconcilieChildren = (
//   dom: DOM,
//   currentChildInstance: HuyuInstance,
//   nextVDom: VNode
// ) => {
//   let nextChildElements = nextVDom.props.children;
//   let newChildInstances = [];

// };

const createDom = (vDom: VDom, ownerDom: DOM) => {
  if (Array.isArray(vDom)) {
    return vDom.map((d) => createDom(d, ownerDom));
  }

  let element: HTMLElement | Text | SVGSVGElement;

  if (vDom.type === TEXT_ELEMENT) {
    element = document.createTextNode(
      (vDom as VNode<{ nodeValue: string }>).props.nodeValue
    );
  } else if (vDom.type === SVG_ELEMENT) {
    element = document.createElementNS("http://www.w3.org/2000/svg", vDom.type);
  } else {
    element = document.createElement(vDom.type as string);
  }

  if (vDom.type !== TEXT_ELEMENT) {
    updateDom(element, vDom.props);
  }
  

  (vDom.props.children || []).forEach((child) => createDom(child, element));

  if (!ownerDom) {
    return element;
  } else {
    return ownerDom.appendChild(element);
  }
};

const updateDom = (dom: DOM, props) => {
  for (const [key, value] of Object.entries(props)) {
    if (key === "children") {
    } else if (key.startsWith("on")) {
      updateDomEvent(dom, key, value);
    } else if (key === "style") {
      updateDomStyle(dom, value);
    } else {
      if (key === "key" || key === "ref") {
        continue;
      }
      updateDomAttribute(dom, key, value);
    }
  }
};

const updateDomStyle = (dom: DOM, style) => {
  for (const [key, value] of Object.entries(style)) {
    dom["style"][key] = value;
  }
};

const updateDomEvent = (dom: DOM, eventName: string, event) => {
  dom.addEventListener(eventName.toLowerCase().substring(2), event);
};

const updateDomAttribute = (dom: DOM, key, value) => {
  (dom as SVGSVGElement | HTMLElement).setAttribute(key, value);
};

// const isEvent = (key: string) => key.startsWith("on");
// const isStyle = (key: string) => {
//   return key === "style" && !isEvent(key);
// };
// const isProperty = (key:string) => {
//   return key !== "children" && !isEvent(key) && !isStyle(key)
// }
