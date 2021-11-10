/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import esbuild from "esbuild";
import logger from "./logger";

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
    logger.info(`🚀 using esbuild-loader for ts(x)`);

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
