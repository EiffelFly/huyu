import { SVG_ELEMENT, TEXT_ELEMENT, __DEV__ } from "./constant";
import { createVDom } from "./create-element";
import { DOM, HuyuElement, HuyuInstance, VDom, VNode } from "./type";

let rootInstance = null;
let route = [];

/**
 * Todo:
 *
 * - Make sure HuyuInstance.dom is HTMLElement not HTMLElement[]
 * - updateDOM
 * - setup apporiate test
 */

type RenderOptions = {
  forgetInstance?: boolean;
};

export const render = (
  huyuElement: HuyuElement,
  ownerDom: DOM | null,
  options?: RenderOptions
) => {
  let vDom;
  if (huyuElement) {
    vDom = createVDom(huyuElement);
  }

  const newInstance = reconcilie(ownerDom, rootInstance, vDom ? vDom : null);
  rootInstance = newInstance;

  if (options?.forgetInstance) {
    rootInstance = null;
  }

  if (__DEV__) {
    console.log(route);
  }
};

const reconcilie = (
  ownerDom: Node | DOM | null,
  currentInstance: HuyuInstance | HuyuInstance[],
  nextVDom: VDom
) => {
  if (Array.isArray(currentInstance)) {
    if (!nextVDom) {
      if (__DEV__) {
        console.log(
          "0 - currentInstance is array, nextVDom is null, delete all old elements",
          currentInstance,
          nextVDom
        );
        route.push(0);
      }

      for (const instance of currentInstance) {
        const targetDom = instance.dom;

        if (Array.isArray(targetDom)) {
          for (const dom of targetDom) {
            ownerDom.removeChild(dom);
          }
        } else {
          ownerDom.removeChild(targetDom);
        }
      }
    } else if (Array.isArray(nextVDom)) {
      let index = 0;
      let newInstnace = [];
      const maxLength = Math.max(currentInstance.length, nextVDom.length);

      while (index < maxLength) {
        if (!currentInstance[index] && nextVDom[index]) {
          if (__DEV__) {
            console.log(
              "1 - currentInstance and nextVDom are array, currentInstance[index] not exist, create and append new instance",
              currentInstance[index],
              nextVDom[index]
            );
            route.push(1);
          }

          const instance = createInstance(nextVDom, null);
          ownerDom.appendChild(instance.dom);
          newInstnace.push(instance);
          index++;
          continue;
        }

        if (currentInstance[index] && !nextVDom[index]) {
          if (__DEV__) {
            console.log(
              "2 - currentInstance and nextVDom are array, nextVDom[index] not exist, delete the old dom element",
              currentInstance[index],
              nextVDom[index]
            );
            route.push(2);
          }

          const targetInstance = currentInstance[index];

          if (Array.isArray(targetInstance)) {
            for (const instance of targetInstance) {
              const targetDom = instance.dom;
              if (Array.isArray(targetDom)) {
                for (const node of targetDom) {
                  ownerDom.removeChild(node);
                }
              } else {
                ownerDom.removeChild(targetDom);
              }
            }
          } else {
            const targetDom = targetInstance.dom;
            if (Array.isArray(targetDom)) {
              for (const node of targetDom) {
                ownerDom.removeChild(node);
              }
            } else {
              ownerDom.removeChild(targetDom);
            }
          }

          index++;
          continue;
        }

        if (__DEV__) {
          console.log(
            "3 - currentInstance and nextVDom are array, currentInstance and nextVDom both exist, reconcile",
            currentInstance[index],
            nextVDom[index]
          );
          route.push(3);
        }

        const instance = reconcilie(
          ownerDom,
          currentInstance[index],
          nextVDom[index]
        );

        newInstnace.push(instance);
        index++;
      }
      return newInstnace;
    } else {
      if (__DEV__) {
        console.log(
          "4 - currentInstance is array, reconcile first element and delete old element",
          currentInstance,
          nextVDom
        );
        route.push(4);
      }

      const newInstance = reconcilie(ownerDom, currentInstance[0], nextVDom);

      let index = 1;

      while (index < currentInstance.length) {
        const targetDom = currentInstance[index].dom;
        if (Array.isArray(targetDom)) {
          for (const node of targetDom) {
            ownerDom.removeChild(node);
          }
        } else {
          ownerDom.removeChild(targetDom);
        }

        index++;
      }
      return newInstance;
    }
  } else {
    if (!currentInstance) {
      if (__DEV__) {
        console.log(
          "5 - currentInstance is null, create new instance",
          currentInstance,
          nextVDom
        );
        route.push(5);
      }

      if (Array.isArray(nextVDom) && nextVDom.length === 0) {
        console.log("6 - nextVdom is null too, early return");
        route.push(6);
        return null;
      } else {
        if (!nextVDom) {
          console.log("6 - nextVdom is null too, early return");
          route.push(6);
          return null;
        }
      }

      const instance = createInstance(nextVDom, null);

      if (Array.isArray(instance)) {
        for (let i = 0; i < instance.length; i++) {
          updateDom(instance[i].dom, instance[i].vDom.props);
          ownerDom.appendChild(instance[i].dom);
        }
      } else {
        updateDom(instance.dom, instance.vDom.props);
        ownerDom.appendChild(instance.dom);
      }

      return instance;
    } else if (!nextVDom) {
      if (__DEV__) {
        console.log(
          "7 - nextVdom is null, delete all instance",
          currentInstance,
          nextVDom
        );
        route.push(7);
      }

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
      /** reconcile first element than create new instance afterward may be more performant */

      if (__DEV__) {
        console.log(
          "8 - currentInstance is object, nextVdom is array, remove all old dom and create new instance",
          currentInstance,
          nextVDom
        );
        route.push(8);
      }

      let index = 0;
      let instances = [];

      ownerDom.removeChild(currentInstance.dom as HTMLElement);

      while (index < nextVDom.length) {
        const instance = createInstance(nextVDom[index], null);
        updateDom(instance.dom, instance.vDom.props);
        ownerDom.appendChild(instance.dom);
        instances.push(instance);
        index++;
      }

      return instances;
    } else {
      if ((currentInstance.vDom as VNode).type === nextVDom.type) {
        if (__DEV__) {
          console.log(
            "9 - currentInstance and nextVdom are object, same type, reconcile",
            currentInstance,
            nextVDom
          );
          route.push(9);
        }

        const newChildrenInstance = reconcilie(
          currentInstance.dom as HTMLElement,
          currentInstance.childrenInstance,
          nextVDom.props.children
        );

        if (nextVDom.type === TEXT_ELEMENT) {
          if (
            (currentInstance.vDom as VNode<{ nodeValue: string }>).props
              .nodeValue !==
            (nextVDom as VNode<{ nodeValue: string }>).props.nodeValue
          ) {
            (currentInstance.dom as HTMLElement).nodeValue = (
              nextVDom as VNode<{ nodeValue: string }>
            ).props.nodeValue;
          }
        } else {
          updateDom(currentInstance.dom as HTMLElement, nextVDom.props);
        }

        return {
          dom: currentInstance.dom,
          vDom: nextVDom,
          childrenInstance: newChildrenInstance,
        };
      } else {
        if (__DEV__) {
          console.log(
            "10 - currentInstance and nextVdom are object, different type, delete old dom element and create new instance",
            currentInstance,
            nextVDom
          );
          route.push(10);
        }

        const instance = createInstance(nextVDom, null);
        updateDom(instance.dom, instance.vDom.props);
        ownerDom.replaceChild(instance.dom, currentInstance.dom as HTMLElement);
        return instance;
      }
    }
  }
};

const createInstance = (vDom: VDom, ownerDom: DOM) => {
  if (Array.isArray(vDom)) {
    return vDom.map((d) => createInstance(d, ownerDom));
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

  // if (vDom.type !== TEXT_ELEMENT) {
  //   updateDom(element, vDom.props);
  // }

  if (ownerDom) {
    ownerDom.appendChild(element);
  }

  if (vDom.props.children.length === 0) {
    return {
      dom: element,
      vDom: vDom,
      childrenInstance: null,
    };
  }

  let childrenInstance = [];

  for (const child of vDom.props.children) {
    const childInstance = createInstance(child, element);
    childrenInstance.push(childInstance);
  }

  return {
    dom: element,
    vDom: vDom,
    childrenInstance: childrenInstance,
  };
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
