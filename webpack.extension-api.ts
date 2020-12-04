
import path from "path";
import webpack from "webpack";
import { sassCommonVars } from "./src/common/vars";

export default function (): webpack.Configuration {
  const entry = "./src/extensions/extension-api.ts";
  const outDir = "./src/extensions/npm/extensions/dist";

  return {
    // Compile for Electron for renderer process
    // see <https://webpack.js.org/configuration/target/>
    target: "electron-renderer",
    entry,
    // this is the default mode, so we should make it explicit to silence the warning
    mode: "production",
    output: {
      filename: "extension-api.js",
      // need to be an absolute path
      path: path.resolve(__dirname, `${outDir}/src/extensions`),
      // can be use in commonjs environments
      // e.g. require('@k8slens/extensions')
      libraryTarget: "commonjs"
    },
    optimization: {
      // we don't really need minimize
      // default is true
      minimize: false
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "babel-loader",
              options: {
                // for lingui
                // https://lingui.js.org/guides/typescript.html
                // just in case these are not in .babelrc
                presets: [
                  ["@babel/preset-env"],
                  ["@babel/preset-react"],
                  ["@lingui/babel-preset-react"]
                ],
              }
            },
            {
              loader: "ts-loader",
              options: {
                transpileOnly: true,
                // !! ts-loader will use tsconfig.json at folder root
                // !! changes in tsconfig.json may have side effects
                // !! on '@k8slens/extensions' module
                compilerOptions: {
                  declaration: true, // output .d.ts
                  sourceMap: false, // to override sourceMap: true in tsconfig.json
                  outDir, // where the .d.ts should be located
                  // for lingui
                  // https://lingui.js.org/guides/typescript.html
                  jsx: "preserve",
                  target: "es2016"
                }
              }
            }
          ]
        },
        // for src/renderer/components/fonts/roboto-mono-nerd.ttf
        // in src/renderer/components/dock/terminal.ts 95:25-65
        {
          test: /\.(ttf|eot|woff2?)$/,
          use: {
            loader: "url-loader",
            options: {
              name: "fonts/[name].[ext]"
            }
          }
        },
        // for import scss files
        {
          test: /\.s?css$/,
          use: [
            // creates `style` nodes from JS strings
            "style-loader",
            // translates CSS into CommonJS
            "css-loader",
            {
              loader: "sass-loader",
              options: {
                prependData: `@import "${path.basename(sassCommonVars)}";`,
                sassOptions: {
                  includePaths: [
                    path.dirname(sassCommonVars)
                  ]
                },
              }
            },
          ]
        }
      ]
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
      // the alias is to avoid webpack warning
      // "require.extensions is not supported by webpack. Use a loader instead."
      // from ./src/extensions/cluster-feature.ts
      // the trick is from <https://github.com/handlebars-lang/handlebars.js/issues/953#issuecomment-239874313>
      alias: {
        "handlebars": "handlebars/dist/handlebars.js"
      }
    },
    plugins: [
      new webpack.ProgressPlugin({ percentBy: "entries" }),
      // In ts-loader's README they said to output a built .d.ts file,
      // you can set "declaration": true in tsconfig.extensions.json,
      // and use the DeclarationBundlerPlugin in your webpack config... but
      // !! the DeclarationBundlerPlugin doesn't work anymore, author archived it.
      // https://www.npmjs.com/package/declaration-bundler-webpack-plugin
      // new DeclarationBundlerPlugin({
      //   moduleName: '@k8slens/extensions',
      //    out: 'extension-api.d.ts',
      // })
    ]
  };
}
