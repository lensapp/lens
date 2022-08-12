/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import path from "path";

export default {
  entry: "./node_modules/node-fetch/src/index.js",
  output: {
    library: {
      type: "module",
    },
    path: path.resolve(__dirname, "..", "build", "webpack"),
    filename: "node-fetch.bundle.js",
    module: true,
    clean: true,
    asyncChunks: false, // This is required so that only one file is created
  },
  experiments: {
    outputModule: true,
  },
  mode: "production",
  target: "electron-renderer",
  optimization: {
    concatenateModules: true,
    minimize: true,
  },
  externals: {
    "node:buffer": "commonjs node:buffer",
    buffer: "commonjs node:buffer",
    worker_threads: "commonjs node:worker_threads",
    "node:fs": "commonjs node:fs",
    "node:https": "commonjs node:https",
    "node:http": "commonjs node:http",
    "node:net": "commonjs node:net",
    "node:path": "commonjs node:path",
    "node:process": "commonjs node:process",
    "node:stream/web": "commonjs node:stream/web",
    "node:stream": "commonjs node:stream",
    "node:url": "commonjs node:url",
    "node:util": "commonjs node:util",
    "node:zlib": "commonjs node:zlib",
  },
  resolve: {
    extensions: [".js"],
  },
};
