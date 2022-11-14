/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import path from "path";

export default {
  entry: "./node_modules/node-fetch/src/index.js",
  output: {
    path: path.resolve(__dirname, "..", "build", "webpack"),
    filename: "node-fetch.bundle.js",
    library: {
      name: "NodeFetch",
      type: "commonjs",
    },
    clean: true,
    asyncChunks: false, // This is required so that only one file is created
  },
  mode: "production",
  target: "electron-renderer",
  optimization: {
    concatenateModules: true,
    minimize: true,
  },
  externalsPresets: {
    node: true,
  },
  resolve: {
    extensions: [".js"],
  },
};
