/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import esbuild from "esbuild";
import type { Options as TSLoaderOptions } from "ts-loader";
import { once } from "lodash";

const getTsLoader = (options: Partial<TSLoaderOptions>, testRegExp: RegExp) => ({
  test: testRegExp,
  exclude: /node_modules/,
  use: {
    loader: "ts-loader",
    options,
  },
});

const printUsingEsbuildLoader = once(() => {
  console.info(`\n🚀 using esbuild-loader for ts(x)`);
});

const getEsbuildLoader = (options: Partial<TSLoaderOptions>, testRegExp: RegExp) => (printUsingEsbuildLoader(), {
  test: testRegExp,
  loader: "esbuild-loader",
  options: {
    loader: "tsx",
    target: "ES2019",
    implementation: esbuild,
  },
});

const getTypescriptLoaderImpl = process.env.LENS_DEV_USE_ESBUILD_LOADER === "true"
  ? getEsbuildLoader
  : getTsLoader;

// by default covers react/jsx-stuff
const defaultTestRegExp = /\.tsx?$/;

/**
 * A function returning webpack ts/tsx loader
 * depends on env LENS_DEV_USE_ESBUILD_LOADER to use esbuild-loader (faster) or good-old ts-loader
 * @returns ts/tsx webpack loader configuration object
 */
export const getTypescriptLoader = (options?: Partial<TSLoaderOptions>, testRegExp?: RegExp) => {
  options ??= {};
  options.transpileOnly ??= true;
  testRegExp ??= defaultTestRegExp;

  return getTypescriptLoaderImpl(options, testRegExp);
};
