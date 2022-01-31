/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import esbuild from "esbuild";
import type { Options as TSLoaderOptions } from "ts-loader";

/**
 * A function returning webpack ts/tsx loader
 * depends on env LENS_DEV_USE_ESBUILD_LOADER to use esbuild-loader (faster) or good-old ts-loader
 * @returns ts/tsx webpack loader configuration object
 */
const getTSLoader = (options: Partial<TSLoaderOptions> = {}, testRegExp?: RegExp) => {
  testRegExp ??= /\.tsx?$/; // by default covers react/jsx-stuff
  options.transpileOnly ??= true;

  if (process.env.LENS_DEV_USE_ESBUILD_LOADER === "true") {
    console.info(`\n🚀 using esbuild-loader for ts(x)`);

    return {
      test: testRegExp,
      loader: "esbuild-loader",
      options: {
        loader: "tsx",
        target: "es2015",
        implementation: esbuild,
      },
    };
  }

  return {
    test: testRegExp,
    exclude: /node_modules/,
    use: {
      loader: "ts-loader",
      options,
    },
  };
};

export default getTSLoader;
