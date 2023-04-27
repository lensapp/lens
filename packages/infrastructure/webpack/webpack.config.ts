import { configForNode } from "./src/node-config";
import nodeExternals from "webpack-node-externals";

export default {
  ...configForNode,
  externals: [nodeExternals({ modulesFromFile: true })],
};
