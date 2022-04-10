## 1. Define type

Define the necessary types: VNode, Ref, Component children type, Key.

## 2. Fundamental function: CreateElement, render

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
  - Recursive append children.
    - Very deep recursion may cause stackoverflow.
</details>



## Setup esbuild

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

## 3 - Add Babel to transform jsx and custom jsx-runtime