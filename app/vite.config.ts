import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: {
    jsxFactory: "_jsx",
    jsxFragment: "_jsxFragment",
    jsxInject: `import { createElement as _jsx, Fragment as _jsxFragment } from "@huyu/core";`,
  },
});
