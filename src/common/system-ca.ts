import { isMac, isWindows } from "./vars";

if (isMac) {
  console.warn("//FIXME: MAC-CA IMPORT ERROR!");
  // require("mac-ca");
}
if (isWindows) {
  require("win-ca").inject("+") // see: https://github.com/ukoloff/win-ca#caveats
}
