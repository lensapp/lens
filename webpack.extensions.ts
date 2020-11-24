
import path from 'path';
import webpack from "webpack";
import nodeExternals from "webpack-node-externals";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

import { sassCommonVars } from "./src/common/vars";

export default function (): webpack.Configuration {
    return {
        // Compile for Electron for renderer process
        // see <https://webpack.js.org/configuration/target/>
        target: "electron-renderer",
        externals: [
             // in order to ignore all modules in node_modules folder
             // <https://www.npmjs.com/package/webpack-node-externals>
             nodeExternals()
        ],
        devtool: 'inline-source-map',
        entry: './src/extensions/extension-api.ts',
        output: {
            filename: 'extension-api.js',
            // need to be an absolute path
            path: path.resolve(__dirname, 'src/extensions/npm/extensions/dist/src/extensions'),
            libraryTarget: "commonjs"
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    options: {
                        configFile: 'tsconfig.extensions.json',
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
                // for import scss files
                {
                    test: /\.s?css$/,
                    use: [
                        // https://webpack.js.org/plugins/mini-css-extract-plugin/
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader",
                            options: {
                                sourceMap: true
                            },
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: true,
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
            extensions: ['.ts', '.tsx']
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
            // }),
            new MiniCssExtractPlugin({
                filename: "[name].css",
            }),
        ]
    };
}
