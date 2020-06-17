import { isMac, isWindows } from "./vars";

if (isMac) {
  // fixme: mac-ca import error
  // require("mac-ca");
}
if (isWindows) {
  require("win-ca").inject("+") // see: https://github.com/ukoloff/win-ca#caveats
}
