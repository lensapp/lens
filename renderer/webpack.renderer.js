// fixme: convert to typescript (support webpack types, reuse vars.ts)
const path = require("path");

module.exports = function (config, env) {
  const {rules} = config.module;

  // patch-fix sass-loader
  const sassLoaderName = "sass-loader";
  const sassLoaderRule = rules.find(rule => {
    if (Array.isArray(rule.use)) return rule.use.includes(sassLoaderName)
    return rule.use === sassLoaderName;
  });
  if (sassLoaderRule) {
    let index = sassLoaderRule.use.findIndex(loader => loader === sassLoaderName);
    sassLoaderRule.use[index] = {
      loader: sassLoaderName,
      options: {
        prependData: '@import "vars.scss";',
        sassOptions: {
          includePaths: [
            path.resolve(__dirname, "components")
          ]
        }
      }
    }
  }

  // add inline svg icons support
  rules.push({
    test: /\.txt$/,
    use: 'raw-loader'
  });

  return config;
}
