import { isMac, isWindows } from "./vars";
import winCa from "win-ca"
import macCa from "mac-ca"
import logger from "../main/logger"

if (isMac) {
  for (const crt of macCa.all()) {
    const attributes = crt.issuer?.attributes?.map((a: any) => `${a.name}=${a.value}`)
    logger.debug("Using host CA: " + attributes.join(","))
  }
}
if (isWindows) {
  winCa.inject("+") // see: https://github.com/ukoloff/win-ca#caveats
}
