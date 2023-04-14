import path from "path";

export default {
  entry: "./index.ts",
  output: {
    path: path.resolve("dist"),
    filename: "index.cjs",
    library: {
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
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: "ts-loader",
        options: {
          compilerOptions: {
            declaration: true,
            sourceMap: false,
            outDir: path.resolve("./dist/"),
          },
        },
      }
    ]
  },
  resolve: {
    extensions: [".ts"],
  }
};
