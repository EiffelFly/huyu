import { SVG_ELEMENT, TEXT_ELEMENT } from "./constant";
import { createVDom } from "./create-element";
import { DOM, FC, HuyuElement, HuyuInstance, VDom, VNode } from "./type";

let rootInstance = null;

export const render = (huyuElement: HuyuElement, ownerDom: DOM | null) => {
  let vDom;
  if (huyuElement) {
    vDom = createVDom(huyuElement);
  }
  // console.log("root-instance", rootInstance);
  const newInstance = reconcilie(ownerDom, rootInstance, vDom ? vDom : null);
  rootInstance = newInstance;
};

const reconcileV2 = (
  ownerDom: Node | DOM | null,
  currentInstance: HuyuInstance | HuyuInstance[],
  nextVDom: VDom
) => {
  const newInstance = createInstance(nextVDom, null);

  if (Array.isArray(currentInstance)) {
    let index = 0;
    const maxLength = Math.max(currentInstance.length, newInstance.length);

    while (index < maxLength) {}
  } else {
  }
};

const reconcilie = (
  ownerDom: Node | DOM | null,
  currentInstance: HuyuInstance | HuyuInstance[],
  nextVDom: VDom
) => {
  // console.log("reconcile begin", ownerDom, currentInstance, nextVDom);

  if (Array.isArray(currentInstance)) {
    console.log("currentInstance is array", nextVDom);

    if (Array.isArray(nextVDom)) {
      let index = 0;
      let newInstnace = [];
      const maxLength = Math.max(currentInstance.length, nextVDom.length);

      while (index < maxLength) {
        // console.log(index, currentInstance[index], nextVDom[index])

        if (!currentInstance[index] && nextVDom[index]) {
          const instance = createInstance(nextVDom, null);
          ownerDom.appendChild(instance.dom);
          newInstnace.push(instance);
          index++;
          continue;
        }

        if (currentInstance[index] && !nextVDom[index]) {
          console.log("delete old dom");
          if (Array.isArray(currentInstance[index].dom)) {
            for (const node of currentInstance[index].dom as HTMLElement[]) {
              ownerDom.removeChild(node);
            }
          } else {
            ownerDom.removeChild(currentInstance[index].dom as HTMLElement);
          }
          index++;
          continue;
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
      const newInstance = reconcilie(ownerDom, currentInstance[0], nextVDom);

      let index = 1;

      while (index < currentInstance.length) {
        if (Array.isArray(currentInstance[index].dom)) {
          for (const node of currentInstance[index].dom as HTMLElement[]) {
            ownerDom.removeChild(node);
          }
        } else {
          ownerDom.removeChild(currentInstance[index].dom as HTMLElement);
        }
        index++;
      }
      return newInstance;
    }
  } else {
    if (!currentInstance) {
      if (Array.isArray(nextVDom) && nextVDom.length === 0) {
        console.log("early return");
        return null;
      } else {
        if (!nextVDom) {
          console.log("early return");
          return null;
        }
      }

      /** We need to create a new instance */
      console.log("create brand new instance");

      const instance = createInstance(nextVDom, null);

      console.log(instance);

      if (Array.isArray(instance)) {
        for (let i = 0; i < instance.length; i++) {
          ownerDom.appendChild(instance[i].dom);
        }
      } else {
        ownerDom.appendChild(instance.dom);
      }

      return instance;
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
        let instances = [];

        const maxIndex = Math.max(currentInstance.dom.length, nextVDom.length);

        while (index < maxIndex) {
          if (!currentInstance.vDom[index] && nextVDom[index]) {
            const instance = createInstance(nextVDom[index], null);
            ownerDom.appendChild(instance.dom);
            instances.push(instance);
            index++;
            continue;
          }

          if (currentInstance.vDom[index] && !nextVDom[index]) {
            ownerDom.removeChild(currentInstance.dom[index]);
            index++;
            continue;
          }

          if (currentInstance.vDom[index].type !== nextVDom[index].type) {
            const instance = createInstance(nextVDom[index], null);
            ownerDom.replaceChild(instance.dom, currentInstance.dom[index]);
            instances.push(instance);
            index++;
          } else {
            console.log("reconcile children", currentInstance);
            const newChildrenInstance = reconcilie(
              currentInstance.dom[index],
              currentInstance.childrenInstance[index],
              nextVDom[index].props.children
            );

            instances.push({
              dom: currentInstance.dom[index],
              vDom: nextVDom[index],
              childrenInstance: newChildrenInstance,
            });
          }
        }
        return instances;
      } else {
        console.log("one-to-many");

        let index = 0;
        let instances = [];

        ownerDom.removeChild(currentInstance.dom);

        while (index < nextVDom.length) {
          const instance = createInstance(nextVDom[index], null);
          ownerDom.appendChild(instance.dom);
          instances.push(instance);
          index++;
        }

        return instances;
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

        const instance = createInstance(nextVDom, null);
        ownerDom.appendChild(instance.dom);
        return instance;
      } else {
        if ((currentInstance.vDom as VNode).type === nextVDom.type) {
          console.log(
            "one-to-one same-type reconcile children",
            currentInstance,
            nextVDom
          );

          const newChildrenInstance = reconcilie(
            currentInstance.dom,
            currentInstance.childrenInstance,
            nextVDom.props.children
          );

          if (nextVDom.type === TEXT_ELEMENT) {
            if (
              (currentInstance.vDom as VNode<{ nodeValue: string }>).props
                .nodeValue !==
              (nextVDom as VNode<{ nodeValue: string }>).props.nodeValue
            ) {
              currentInstance.dom.nodeValue = (
                nextVDom as VNode<{ nodeValue: string }>
              ).props.nodeValue;
            }
          } else {
            updateDom(currentInstance.dom, nextVDom.props);
          }

          return {
            dom: currentInstance.dom,
            vDom: nextVDom,
            childrenInstance: newChildrenInstance,
          };
        } else {
          console.log("one-to-one different-type reconcile");
          const instance = createInstance(nextVDom, null);

          console.log(instance, currentInstance);

          ownerDom.replaceChild(instance.dom, currentInstance.dom);
          return instance;
        }
      }
    }
  }
};

// const reconcilieChildren = (
//   ownerDom: Node | DOM | null,
//   childInstance: HuyuInstance,
//   childNextVDom: VNode[]
// ) => {
//   let index = 0;
//   let newChildrenInstance = [];

//   while (index < maxLength) {
//     const newInstance = reconcilie(
//       ownerDom,
//       childInstance[index],
//       childNextVDom[index]
//     );
//     newChildrenInstance.push(newInstance);
//     index++;
//   }

//   const newInstance = reconcilie(ownerDom, childInstance, childNextVDom);

//   return newChildrenInstance;
// };

const createInstance = (vDom: VDom, ownerDom: DOM) => {
  if (Array.isArray(vDom)) {
    return vDom.map((d) => createInstance(d, ownerDom)).flat();
  }

  let element: HTMLElement | Text | SVGSVGElement;

  if (vDom.type === TEXT_ELEMENT) {
    element = document.createTextNode(
      (vDom as VNode<{ nodeValue: string }>).props.nodeValue
    );
    console.log(element)
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
    childrenInstance: childrenInstance.flat(),
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
