
import path from 'path';
import webpack from "webpack";
import { sassCommonVars } from "./src/common/vars";

export default function (): webpack.Configuration {
    return {
        // Compile for Electron for renderer process
        // see <https://webpack.js.org/configuration/target/>
        target: "electron-renderer",
        entry: './src/extensions/extension-api.ts',
        output: {
            filename: 'extension-api.js',
            // need to be an absolute path
            path: path.resolve(__dirname, 'src/extensions/npm/extensions/dist/src/extensions'),
            // can be use in commonjs environments
            // e.g. require('@k8slens/extensions')
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
                        // Creates `style` nodes from JS strings
                        "style-loader",
                        // Translates CSS into CommonJS
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
            extensions: ['.ts', '.tsx', '.js']
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
