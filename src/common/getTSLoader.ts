/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import esbuild from "esbuild";

/**
 * A function returning webpack ts/tsx loader
 *
 * depends on env LENS_DEV_USE_ESBUILD_LOADER to use esbuild-loader (faster) or good-old ts-loader
 *
 * @param testRegExp - the regex for webpack to conditional find the files
 * @returns ts/tsx webpack loader configuration object
 */
const getTSLoader = (
  testRegExp: RegExp, transpileOnly = true,
) => {
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
      options: {
        transpileOnly,
      },
    },
  };
};

export default getTSLoader;
