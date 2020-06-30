import { isMac, isWindows } from "./vars";
import winca from "win-ca"
import macca from "mac-ca"
import logger from "../main/logger"

if (isMac) {
  for (const crt of macca.all()) {
    const attributes = crt.issuer?.attributes?.map((a: any) => `${a.name}=${a.value}`)
    logger.debug("Using host CA: " + attributes.join(","))
  }
}
if (isWindows) {
  winca.inject("+") // see: https://github.com/ukoloff/win-ca#caveats
}
