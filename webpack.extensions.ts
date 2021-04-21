
import path from "path";
import webpack from "webpack";
import { sassCommonVars, isDevelopment, isProduction } from "./src/common/vars";

export default function generateExtensionTypes(): webpack.Configuration {
  const entry = "./src/extensions/extension-api.ts";
  const outDir = "./src/extensions/npm/extensions/dist";

  return {
    // Compile for Electron for renderer process
    // see <https://webpack.js.org/configuration/target/>
    target: "electron-renderer",
    entry,
    // this is the default mode, so we should make it explicit to silence the warning
    mode: isProduction ? "production" : "development",
    output: {
      filename: "extension-api.js",
      // need to be an absolute path
      path: path.resolve(__dirname, `${outDir}/src/extensions`),
      // can be use in commonjs environments
      // e.g. require('@k8slens/extensions')
      libraryTarget: "commonjs"
    },
    cache: isDevelopment,
    optimization: {
      minimize: false, // speed up types compilation
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          options: {
            // !! ts-loader will use tsconfig.json at folder root
            // !! changes in tsconfig.json may have side effects
            // !! on '@k8slens/extensions' module
            compilerOptions: {
              declaration: true, // output .d.ts
              sourceMap: false, // to override sourceMap: true in tsconfig.json
              outDir // where the .d.ts should be located
            }
          }
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
        {
          test: /\.(jpg|png|svg|map|ico)$/,
          use: {
            loader: "file-loader",
            options: {
              name: "images/[name]-[hash:6].[ext]",
              esModule: false, // handle media imports in <template>, e.g <img src="../assets/logo.svg"> (react)
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
      extensions: [".ts", ".tsx", ".js"]
    },
    plugins: [
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
