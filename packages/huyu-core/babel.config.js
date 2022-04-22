module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    [
      "@babel/preset-typescript",
      { jsxPragma: "_jsx", pragmaFrag: "_jsxFragment" },
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
