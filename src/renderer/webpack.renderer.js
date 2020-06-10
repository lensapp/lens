// fixme: convert to typescript (support webpack types, reuse vars.ts)
const path = require("path");

module.exports = function (config, env) {
  const {module, plugins} = config;
  const {rules} = module;

  // localization support
  // https://lingui.js.org/guides/typescript.html
  rules.push({
    test: /\.po$/,
    use: '@lingui/loader'
  });
  patchLoader(".tsx", "ts-loader", loader => {
    loader.options = Object.assign({}, loader.options, {
      compilerOptions: {
        jsx: "preserve", // @lingui/babel-preset-react
        target: "es2016", // @lingui/babel-preset-react
        module: "esnext", // https://webpack.js.org/guides/code-splitting/#dynamic-imports
      }
    })
    return ["babel-loader", loader]
  });

  // sass common vars file import
  patchLoader(".scss", "sass-loader", loader => {
    loader.options = Object.assign({}, loader.options, {
      prependData: '@import "vars.scss";',
      sassOptions: {
        includePaths: [
          path.resolve(__dirname, "components")
        ]
      }
    })
    return loader;
  });

  function patchLoader(fileType, loaderName, updater) {
    let rule = rules.find(rule => fileType.match(rule.test));
    if (rule) {
      let loaders = [rule.use].flat();
      let index = loaders.findIndex(loader => loader === loaderName || loader.loader === loaderName);
      let loader = typeof loaders[index] === "string" ? {loader: loaders[index]} : loaders[index];
      loaders[index] = updater(loader);
      rule.use = loaders.flat();
      console.info(`Patched renderer's webpack loader "${loaderName}"`, loader);
    }
  }

  return config;
}
