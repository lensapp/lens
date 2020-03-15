import { NextFunction } from "express";
import proxy from "http-proxy-middleware"
import appConfig from "../config"

const { KUBE_TERMINAL_URL, API_PREFIX, IS_PRODUCTION } = appConfig;

interface ITerminalProxy extends NextFunction {
  upgrade: () => void;
}

export const terminalProxy = proxy({
  target: KUBE_TERMINAL_URL,
  ws: true,
  changeOrigin: true,
  logLevel: IS_PRODUCTION ? "info" : "debug",
  pathRewrite: {
    ["^" + API_PREFIX.TERMINAL]: "" // remove api-prefix
  }
}) as ITerminalProxy;