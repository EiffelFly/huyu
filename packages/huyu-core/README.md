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

<details>

# 9 - Support named function component wrap children

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

# 10 - A playground test whole scenario

### Error

> Uncaught DOMException: Failed to execute 'createElement' on 'Document': The tag name provided ('e=>e.children') is not a valid name.

# 9 - Add Instance

# 10 - diff
