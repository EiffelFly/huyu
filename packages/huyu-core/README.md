# 0 - Define type

Define the necessary types: VNode, Ref, Component children type, Key.

# 1 - Fundamental function: CreateElement, render

<details>
  <summary>Observations</summary>
- Observations

- key and ref are necessary but ugly(They are fundamental as same as props but move out of props to make diff algorithm easier to write)

- Questions
  - How to make the function very easy to understand?
  </details>

<details>
  <summary>Implementation details</summary>

- We want our element to have same shapte

```js

// We don't want this
{
  type: "div",
  props: {
    children: [
      {
        type: "h1",
        props: {
          children: ["This is a Text node"]
        }
      }
    ]
  }
}

// We want this
{
  type: "div",
  props: {
    children: [
      {
        type: "h1",
        props: {
          children: [
            {
              type: "text",
              props: {
                nodeValue: "This is a Text node"
                children: []
              }
            }
          ]
        }
      }
    ]
  }
}
```

### CreateElement

```js
export const createElement = (
  type: string,
  props: Record<string, any> | null | undefined,
  ...children: ComponentChildren
): VNode<Record<string, any>> => {
  // <snip>
  return vNode;
};
```

The reason we name parameters other than type and props to children is because jsx

```js
// JSX in
const profile = (
  <div>
    <img src="avatar.png" className="profile" />
    <h3>{[user.firstName, user.lastName].join(" ")}</h3>
  </div>
);

// JSX out
const profile = React.createElement(
  "div",
  null,
  React.createElement("img", { src: "avatar.png", className: "profile" }),
  React.createElement("h3", null, [user.firstName, user.lastName].join(" "))
);
```

### render

- Text, SVG and element.
- Recursive append children. - Very deep recursion may cause stackoverflow.
</details>

# 2 - Setup esbuild

<details>
  <summary>Implementation details</summary>

- Install deps: `yarn add -D esbuild esbuild-node-externals`
- Make sure your tsconfig is correct

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "declaration": true,
    "sourceMap": true,
    "outDir": "build",
    "emitDeclarationOnly": true // Don't generate js file, we use rollup to do that
  },
  "include": ["**/*.ts", "**/*.tsx"]
}
```

- Add esbuild script

```js
const esbuild = require("esbuild");

// Automatically exclude all node_modules from the bundled version
const { nodeExternalsPlugin } = require("esbuild-node-externals");

esbuild
  .build({
    entryPoints: ["./src/index.ts"],
    outfile: "build/index.js",
    bundle: true,
    minify: true,
    format: "esm",
    sourcemap: true,
    target: "esnext",
    plugins: [nodeExternalsPlugin()],
  })
  .catch(() => process.exit(1));
```

</details>

# 3 - recursive render children

<details>
  <summary>Observations</summary>
- Observations
  - render's recursion is beautiful but may cause stackoverflow, how to deal with that?
</details>

<details>
  <summary>Implementation details</summary>

```js
(vNode.props.children || []).forEach((child) => render(child, element));
```

</details>

# 4 - Add jsx support and custom jsx-runtime

<details>
  <summary>Implementation details</summary>

### export jsx-runtime for others to use

- We borrow jsx type from @types/react
- We overwrite default jsx function with tsconfig

```js
// At core entrypoint, we need to export the jsx function we want vite to use

import { createElement } from "./create-element";
import { render } from "./reconcile";

export * from "./constant";
export { createElement, createElement as h, render };

// At app tsconfig, we need to specific which jsx-function to use

{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment"
  },
}
```

- This process is a little bit magical, you can confirm this behavior by insert some console.log in your `createElement` or replace custom jsx-function with regular react-jsx, because you doesn't install react, this will throw error

```json
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

### Export jsx-runtime.js file for other usage

```js
import { createElement, Fragment } from "./src/create-element";
export { createElement as jsx, createElement as jsxs, Fragment };
```

```js
// at package.json

{
  "exports": {
    ".": {
      "import": "./build/index.js",
      "require": "./build/index.js"
    },
    "./jsx-runtime": {
      "import": "./jsx-runtime.js",
      "require": "./jsx-runtime.js"
    }
  },
}
```

### With Vite config

The method above can achieve our goal, but we have to manually import our namespace, in order to access createElement function.

We could leverage vite to help us, in this way we don't need to manually import anymore

```js
// vite.config.js

import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: {
    jsxFactory: "_jsx",
    jsxFragment: "_jsxFragment",

    // We use import as to avoid duplicate identifier
    jsxInject: `import { createElement as _jsx, Fragment as _jsxFragment } from "@huyu/core";`,
  },
});
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "preserve"
  }
}
```

#### Reference

- [React - Introducing the New JSX Transform](https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)
- [Vite features - JSX](https://vitejs.dev/guide/features.html#jsx)
- [esbuild - support react 17 jsx issue](https://github.com/evanw/esbuild/issues/334#issuecomment-1054699157)
</details>

# 5 - Support named component

<details>
  <summary>Observations</summary>

- Observations
  - It's not that elegant to do the if...condition to render vNode
  - Looks like other lib, fre.js and preact.js all have some abstract layer to make this much more performant or elegant
  - On the other hand, this method is very easy to read.

</details>

<details>
  <summary>Implementation details</summary>

when we have sytax like

```js
<MyButton color="blue" shadowSize={2}>
  Click Me
</MyButton>
```

it compiles to

```js
React.createElement(MyButton, { color: "blue", shadowSize: 2 }, "Click Me");
```

This is why the VNode["type"] will have type like this

```js
const Component = <div>component</div>

console.log(<Component />)
// -- After JSX transformation --
// Type is component's element
{
  "type": {
    "type": "div",
    "props": {
      "children": [
        {
          "type": "text",
          "props": {
              "children": [],
              "nodeValue": "component"
          }
        }
      ]
    }
  },
  "props": {
      "children": []
  }
}
```

Because jsx expression can only have one parent, so if we change component like this, the props.children will still be empty

```js
const Component = (
  <div>
    <span>component</span>
    <div>hi</div>
  </div>
);

console.log(<Component />)

// -- After JSX transformation --
{
  "type": {
    "type": "div",
    "props": {
      "children": [
        {
          "type": "span",
          "props": {
            "children": [
              {
                "type": "text",
                "props": {
                  "children": [],
                  "nodeValue": "component"
                }
              }
            ]
          }
        },
        {
          "type": "div",
          "props": {
            "children": [
              {
                "type": "text",
                "props": {
                  "children": [],
                  "nodeValue": "hi"
                }
              }
            ]
          }
        }
      ]
    }
  },
  "props": {
    "children": []
  }
}
```

When we encounter element like this, we have to recognize type as element

```js
export const render = (vNode: VNode, ownerDom: Element | null | Text) => {
  let element: Text | Element;
  let wip: VNode

  if (typeof vNode.type === "function") {
    console.log("hi i am function component");
  } else if (typeof vNode.type === "object") {
    console.log("hi i am named component");
    wip = vNode.type;
  } else {
    wip = vNode;
  }

  let wipType = wip.type as string;

  if (wipType === TEXT_ELEMENT) {
    element = document.createTextNode(
      (wip as VNode<{ nodeValue: string }>).props.nodeValue
    );
  } else if (wipType === SVG_ELEMENT) {
    element = document.createElementNS("http://www.w3.org/2000/svg", wipType);
  } else {
    element = document.createElement(wipType);
  }
  // <--snip-->
};

```

#### Reference

- [Babel-test: try how babel compile jsx](https://babeljs.io/repl/#?browsers=defaults%2C%20not%20ie%2011%2C%20not%20ie_mob%2011&build=&builtIns=false&corejs=3.21&spec=false&loose=false&code_lz=GYVwdgxgLglg9mABACwKYBt1wBQEpEDeAUIogE6pQhlIA8AJjAG4B8AEhlogO5xnr0AhLQD0jVgG4iAXyJA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=react&prettier=false&targets=&version=7.17.9&externalPlugins=&assumptions=%7B%7D)
</details>

# 6 - Support function component

<details>
  <summary>Implementation details</summary>

- Function components are different from named and normal component
  - Children come from running the function instead of getting them directly from the props

the wip comes from running the function component

```js
import { SVG_ELEMENT, TEXT_ELEMENT } from "./constant";
import { FC, VNode } from "./type";

export const render = (vNode: VNode, ownerDom: Element | null | Text) => {
  let element: Text | Element;
  let wip: VNode;

  if (typeof vNode.type === "function") {
    console.log("hi i am function component");

    // Run the function component to get the children
    wip = vNode.type(vNode.props);

  } else if (typeof vNode.type === "object") {
    console.log("hi i am named component");
    wip = vNode.type;
  } else {
    wip = vNode;
  }

  let wipType = wip.type as string;

  if (wipType === TEXT_ELEMENT) {
    element = document.createTextNode(
      (wip as VNode<{ nodeValue: string }>).props.nodeValue
    );
  } else if (wipType === SVG_ELEMENT) {
    element = document.createElementNS("http://www.w3.org/2000/svg", wipType);
  } else {
    element = document.createElement(wipType);
  }

  // <--snip-->
};
```

</details>

# 7 - Support Fragment

Caveat, normally you may try to implement Fragment first, but that is not ideal, you may lack of mindset about how to implement component. Fragment is just a component that return children

### Add Fragment

<details>
  <summary>Implementation details</summary>

Fragment is just a function which return children

```js
// Add Fragment
export const Fragment = (props) => {
  return props.children;
};

// Use Fragment
const Test = (
  <Fragment key={"test"}>
    <div>test</div>
  </Fragment>
);
render(Test, document.getElementById("root"));
```

Here is fragment object after being processed by `createElement`

```js


const Frag = (
  <Fragment>
    <div>hi</div>
  </Fragment>
);

// console.log(Frag)

{
  "props": {
    "children": [
      {
        "type": "div",
        "props": {
          "children": [
            {
              "type": "text",
              "props": {
                  "children": [],
                  "nodeValue": "hi"
              }
            }
          ]
        }
      }
    ]
  }
}

// console.log(<Frag />)

{
  "type": {
    "props": {
      "children": [
        {
          "type": "div",
          "props": {
            "children": [
              {
                "type": "text",
                "props": {
                    "children": [],
                    "nodeValue": "hi"
                }
              }
            ]
          }
        }
      ],
      // This is the fragment function component type
      type: e=>e.children
    }
  },
  "props": {
    "children": []
  }
}

```

The processing tree before this section is

- if (type=function) function component -> running function and get the children
- if (type=object) named component -> recognize type as element
- if (type=string) normal component -> process

We need to have better processing tree

- if (type=function) function component
  - if (that_type=object) named compont
  - if (that_type=string) normal component
- if (type=object) named component
  - if (that_type=function) function component
  - if (that_type=string) normal component
- if (type=string) named component

This section will try to accomplish the following

- The flow will be: jsx -> createElement -> createVNode(recursive generate VNode) -> reconcile -> createDOM/updateDOM
- Simplize createElement function
- Accept array as render target
- Flatten array

### createVDom

Recursive function to implement better processing tree

```js
export const createVDom = (element: HuyuElement) => {
  if (typeof element.type === "string") {
    return element;
  }

  if (Array.isArray(element)) {
    return element.map(createVDom).flat();
  }

  if (element.type instanceof Function) {
    return createVDom(element.type(element.props));
  }

  if (element.type instanceof Object) {
    return createVDom(element.type);
  }
};
```

### createDom

Recursive function to create DOM including accept array as created target

```js
export const createDOM = (vDom: VDom, ownerDom: Element | null | Text) => {
  if (Array.isArray(vDom)) {
    return vDom.map((d) => createDOM(d, ownerDom));
  }
  let element: Text | Element;

  if (vDom.type === TEXT_ELEMENT) {
    element = document.createTextNode(
      (vDom as VNode<{ nodeValue: string }>).props.nodeValue
    );
  } else if (vDom.type === SVG_ELEMENT) {
    element = document.createElementNS("http://www.w3.org/2000/svg", vDom.type);
  } else {
    element = document.createElement(vDom.type as string);
  }

  (vDom.props.children || []).forEach((child) => createDOM(child, element));

  if (!ownerDom) {
    return element;
  } else {
    return ownerDom.appendChild(element);
  }
};
```

### New render API

```js
export const render = (
  huyuElement: HuyuElement,
  ownerDom: Element | null | Text
) => {
  let vDom = createVDom(huyuElement);
  return createDOM(vDom, ownerDom);
};
```

</details>

# 8 - Support array children

<details>
  <summary>Implementation details</summary>

```js
// component
const Foo = (
  <div>
    {[0, 1].map((e) => (
      <p>{`hi-${e}`}</p>
    ))}
  </div>
);

// -- After JSX transformation --

{
  "type": "div",
  "key": null,
  "ref": null,
  "props": {
    "children": [ // this is a nested list, in different implementation of react may cause error
      [
        {
          "type": "p",
          "key": null,
          "ref": null,
          "props": {
            "children": [
              {
                "type": "text",
                "key": null,
                "ref": null,
                "props": {
                  "nodeValue": "hi-0",
                  "children": []
                }
              }
            ]
          }
        },
        {
          "type": "p",
          "key": null,
          "ref": null,
          "props": {
            "children": [
              {
                "type": "text",
                "key": null,
                "ref": null,
                "props": {
                  "nodeValue": "hi-1",
                  "children": []
                }
              }
            ]
          }
        }
      ]
    ]
  }
}
```

we use this line to solve list problem

```js
// reconcile

export const createDOM = (vDom: VDom, ownerDom: Element | null | Text) => {
  if (Array.isArray(vDom)) {
    return vDom.map((d) => createDOM(d, ownerDom));
  }

  //<-- snip -->
};
```

You could also flatten the whole structure beforehand, but we choose to leave it for further usage.

```js
export const createElement = (
  type: string | object | FC<any>,
  props: Record<string, any> | null | undefined,
  ...children: ComponentChildren
) => {
  //<-- snip -->

  // We can flat children here, but for the purpose of this project, we leave nested list for
  // further usage.

  let kids =
    children.length > 0
      ? children.map((child) =>
          child instanceof Object ? child : createTextElement(child)
        )
      : [];

  //<-- snip -->
};
```

</details>

# 9 - Support named functional component wrapping children

<details>
  <summary>Implementation details</summary>

Function component wrap with children is relative easy, we just run it and everything is done.

```js
// component
const Foo = (props) => {
  return <div>{props.children}</div>;
};

// -- After JSX transformation --
// console.log(Foo)

(props) => {
  return /* @__PURE__ */ _jsx("div", null, props.children);
}

// -- After JSX transformation --
// console.log(<Foo />)

{
  "type": (props) => {...}
  "key": null,
  "ref": null,
  "props": {
      "children": []
  }
}
```

</details>

# 10 - add style, event and other properties

<details>
  <summary>Implementation details</summary>

### Add style

```js
const Foo = () => {
  return <div style={{ color: "blue" }}>hi</div>;
};

// -- After JSX transformation --
// console.log(Foo)

() => {
  return /* @__PURE__ */ _jsx("div", {
    style: { color: "blue" }
  }, "hi");
}

// -- After JSX transformation --
// console.log(<Foo />)

{
  "type": () => {...}
  "key": null,
  "ref": null,
  "props": {
      "children": []
  }
}
```

We need to have a centralize place to call multiple update functions

```js
const updateDom = (dom: DOM, props) => {
  for (const [key, value] of Object.entries(props)) {
    console.log(key);
    if (key === "children") {
    } else if (key.startsWith("on")) {
      updateDomEvent(dom, key, value);
    } else if (key === "style") {
      updateDomStyle(dom, value);
    } else {
      updateDomAttribute(dom, key, value);
    }
  }
};
```

Then we have to update the style

```js
const updateDomStyle = (dom: DOM, style) => {
  for (const [key, value] of Object.entries(style)) {
    dom["style"][key] = value;
  }
};
```

Finally, our render method will call updateDom

```js
export const render = (huyuElement: HuyuElement, ownerDom: DOM) => {
  let vDom = createVDom(huyuElement);
  let dom = createDom(vDom, ownerDom);
  updateDom(dom, huyuElement.props);
  return dom;
};
```

### Add event listener and other attributes

In this way, we could update style, event and other attributes are almost the same

```js
const updateDomEvent = (dom: DOM, eventName: string, event) => {
  dom.addEventListener(eventName.toLowerCase().substring(2), event);
};
```

```js
const updateDomAttribute = (dom: DOM, attributeName, attribute) => {
  dom[attributeName] = attribute;
};
```

</details>

# 11 - Support aria-? and other attributes

<details>
  <summary>Implementation details</summary>

In previous section, although we could add attributes, but if we encounter something like this, it will failed to update the attribue

```js
const Bar = () => {
  return (
    <button
      key="bar"
      className="hi"
      aria-label="foo"
      disabled={true}
      style={{
        width: "100px",
        display: "flex",
        padding: "12px",
        backgroundColor: "grey",
        color: "white",
      }}
      onClick={() => {
        console.log("hello");
      }}
    >
      <p style={{ margin: "0 auto", color: "honeydew" }}>Click me</p>
    </button>
  );
};
```

Here is how we set these attributes.

```js
const updateDomAttribute = (dom: DOM, key, value) => {
  dom[key] = value;
};
```

The caveat is, for convience, some dom object have pre-defined property outside or attributes, such as style and HTMLInputElement have aria-? attributes.

It all depends on the type of the element which is not reliable, for our usage, we better directly set the attributes.

```js
const updateDomAttribute = (dom: DOM, key, value) => {
  (dom as SVGSVGElement | HTMLElement).setAttribute(key, value);
};
```

Besides that, we want to avoid directly set key and ref attributes on dom

```js
const updateDom = (dom: DOM, props) => {
  for (const [key, value] of Object.entries(props)) {
    if (key === "children") {
    } else if (key.startsWith("on")) {
      updateDomEvent(dom, key, value);
    } else if (key === "style") {
      updateDomStyle(dom, value);
    } else {
      if (key === "key" || key === "ref") {
        // <---- we add this line
        continue;
      }
      updateDomAttribute(dom, key, value);
    }
  }
};
```

### Further reading

- [SO: When to use setAttribute vs .attribute= in JavaScript?](https://stackoverflow.com/questions/3919291/when-to-use-setattribute-vs-attribute-in-javascript)

</details>

# 12 - Update nested children attributes

<details>
  <summary>Implementation details</summary>

In previous section we can update first layer of DOM, but we can't update children's dom

```js
const Bar = () => {
  return (
    <button
      style={{
        width: "100px",
        display: "flex",
        padding: "12px",
        backgroundColor: "grey",
        color: "white",
      }}
    >
      /* this won't show */
      <p style={{ margin: "0 auto", color: "honeydew" }}>Click me</p>
    </button>
  );
};
```

The reason is quite simple, at previous section, in order to simplify the code flow, we put updateDOM out of recursive loop

```js
export const render = (huyuElement: HuyuElement, ownerDom: DOM | null) => {
  let vDom = createVDom(huyuElement);
  let dom = createDom(vDom, ownerDom); // <-- this is where the recursive loop occured
  updateDom(dom, vDom.props);
  return dom;
};
```

We have to bring it back to recursive loop

```js
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
```

Everything is working properly now.

# 13 - Render non-fragment wrapped function components

<details>
  <summary>Implementation details</summary>

This is how we render vDom

```js
export const createVDom = (element: HuyuElement) => {
  if (typeof element.type === "string") {
    console.log("isStr", element);
    return element;
  }

  if (Array.isArray(element)) {
    console.log("isArr", element);
    return element.map(createVDom);
  }

  if (element.type instanceof Function) {
    console.log("isFunc", element);
    return createVDom(element.type(element.props));
  }

  if (element.type instanceof Object) {
    console.log("isObj", element);
    return createVDom(element.type);
  }
};
```

It can process something like this, the process will be:

1. This is a function -> run function
2. Encounter Fragment -> this is a function -> run function
3. Return children is array -> render each child

```js
const Text = () => {
  return (
    <>
      <InputField />
      <Button />
    </>
  );
};
```

But it can't process something like this, the process will be:

1. This is a function -> run function
2. Encounter valid string type -> return element

So we leave these two child as function component, we forgot to render vDom for them

```js
const Text = () => {
  return (
    <div>
      <InputField />
      <Button />
    </div>
  );
};
```

We have to process these children too

```js
export const createVDom = (element: HuyuElement) => {
  if (typeof element.type === "string") {
    if (element.props.children.length > 0) {
      element.props.children = element.props.children.map(createVDom);
    }
    return element;
  }
  // <-- snip -->
};
```

</details>

# 14 - Add a playground that test whole scenario

<details>
  <summary>Implementation details</summary>

### normal component

```js
const Foo = <div>foo</div>;
render(Foo, document.getElementById("root"));
```

### Named component

```js
const Foo = <div>foo</div>;
render(<Foo />, document.getElementById("root"));
```

### Functional component

```js
const Foo = () => {
  return <div>foo</div>;
};
render(<Foo />, document.getElementById("root"));
```

### Functional component wrapping children

```js
const Foo = (props) => {
  return <div>{props.children}</div>;
};
render(<Foo>bar</Foo>, document.getElementById("root"));
```

### Fragment

```js
const frag = () => {
  return (
    <Fragment>
      <div>foo</div>
      <div>bar</div>
    </Fragment>
  );
};
```

### named component wrap functional component

```js
const Foo = () => {
  return (
    <div>
      <InputField />
      <Button />
    </div>
  );
};
```

### array structure

```js
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
```

```js
const NestedArray = () => {
  return <div>{[<p>foo</p>, <p>bar</p>, [<p>baaa</p>, [<p>shit</p>]]]}</div>;
};
```

</details>

# 14 - Add Instance and diff(reconciliation)

When we activate two render, our program will create two dom which is not what we want.

we need a place to memorize the full vDom, compare prevVDom and newVDom and update dom accordingly.

React had a noun for it - Reconciliation, what we will implement here is a simple version of it.

```js
export type HuyuInstance = {
  /** Current instance's dom */
  dom: HTMLElement[] | HTMLElement,

  /** Current instance's vDom */
  vDom: VDom,

  childrenInstance: HuyuInstance[],
};
```

- Every element is at the same order. dom[0] is matching vDom[0] and childInstance[0]
- This is a top-down approach, which means we will compare the whole tree from top to bottom.
- If the parent's type doesn't change, we will leave parent as it is, update attribute and reconcile the children and update the props.
- If the preVDom is single and nextVDom is array, we will replace all the node to avoid situation like below, we don't reconcile their tag one by one, although these two vDom have the same tag at the first element, they are referring to different structure, vice versa.

```js
const Foo = () => {
  return (
    <div>
      <p>hi</p>
      <p>change</p>
    </div>
  );
};

render(<Foo />, document.getElementById("root"));

const Bar = () => {
  return (
    <>
      <div>hi2</div>
      <div>change 2</div>
    </>
  );
};

render(<Bar />, document.getElementById("root"));
```

- For now, if the prev instance is different from new instance, we will replace the entire prev instance with new instance.
- children's instance will be stored at childInstance
- Each item of instance can be array
- Evaluate child instance when we need it
- Will childInstance have parent?

## Drawbacks

- We create childInstance when initialize, which cost a lot
- We have to check whether input is array or not, this make code hard to maintain

## Notable issues

- If we flat at createInstance something wrong will happen when we reconcile, the old instance is flat, but the new vDom is not flat.

# 15 - Setup test environment to check sanity of reconcile algorithm

- We use babel, jest to test.

### Install necessary package

`yarn add -D jest bable-jest @types/jest @babel/core @babel/plugin-transform-react-jsx @babel/preset-env @babel/preset-typescript @testing-library/jest-dom`

### Add. jest.config.js

```js
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  coverageDirectory: "coverage",
  testEnvironment: "jsdom",
  transform: {
    "\\.[jt]sx?$": "babel-jest",
  },
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
};
```

### Add jest-setup.js to import @testing-library/dom

```js
// jest-setup.js
import "@testing-library/jest-dom";
```

### Add babel.config.js

```js
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    ["@babel/preset-typescript"],
  ],
};
```

### Add @babel/plugin-transform-react-jsx to transform jsx

```js
// babel.config.js
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    ["@babel/preset-typescript", { jsxPragma: "_jsx" }],
  ],
  plugins: [
    [
      "@babel/plugin-transform-react-jsx",
      {
        runtime: "classic", // defaults to classic
      },
    ],
  ],
};
```

You have two choices

1. Use comment

```js
//import { createElement } from "../src";
import { render } from "../src/reconcile";
import { _jsx, _jsxFragment } from "../src";

/** @jsx _jsx */
test("should render simple functional component", () => {
  const Hello = () => {
    return <div>hello</div>;
  };

  console.log(<Hello />);

  const ownerDom = document.createElement("div");

  render(<Hello />, ownerDom);
});
```

2. Use pragma nad pragmaFrag options

Caveat: you need to specific jsxPragma and jsxPragmaFrag in "@babel/preset-typescript" because babel think it is type and remove it

- https://github.com/parcel-bundler/parcel/pull/5585
- https://github.com/babel/babel/issues/12585

```js
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    [
      "@babel/preset-typescript",
      { jsxPragma: "_jsx", jsxPragmaFrag: "_jsxFragment" },
    ],
  ],
  plugins: [
    [
      "@babel/plugin-transform-react-jsx",
      {
        runtime: "classic", // defaults to classic
        pragma: "_jsx",
        pragmaFrag: "_jsxFragment",
      },
    ],
  ],
};
```

In this way you could remove comment

```js
//import { createElement } from "../src";
import { render } from "../src/reconcile";
import { _jsx, _jsxFragment } from "../src";

test("should render simple functional component", () => {
  const Hello = () => {
    return <div>hello</div>;
  };

  console.log(<Hello />);

  const ownerDom = document.createElement("div");

  render(<Hello />, ownerDom);
});
```

# 16 - fix naming conflict like `<input type="text" />`
