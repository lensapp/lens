import { isMac, isWindows } from "./vars";

if (isMac) {
  // require("mac-ca"); // fixme: crashes
}
if (isWindows) {
  require("win-ca").inject("+") // see: https://github.com/ukoloff/win-ca#caveats
}
