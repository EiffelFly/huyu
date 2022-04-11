## 0 - Define type

Define the necessary types: VNode, Ref, Component children type, Key.

## 1 - Fundamental function: CreateElement, render

- Observations

  - key and ref are necessary but ugly(They are fundamental as same as props but move out of props to make diff algorithm easier to write)

- Questions
  - How to make the function very easy to understand?

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

## 2 - Setup esbuild

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

## 3 - recursive render children

- Observations
  - render's recursion is beautiful but may cause stackoverflow, how to deal with that?

<details>
  <summary>Implementation details</summary>

```js
(vNode.props.children || []).forEach((child) => render(child, element));
```

</details>

## 4 - Add jsx support and custom jsx-runtime

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

# 5 - Support Fragment

### Add Fragment

Fragment is just a function which return children

```js
export const Fragment = (props) => {
  return props.children;
};
```

# 6 - Support custome component

# 7 - Add Instance

# 8 - diff
