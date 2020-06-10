import "mac-ca"
import winca from "win-ca/api"
import { isWindows } from "./vars";

if (isWindows) {
  winca.inject("+") // see: https://github.com/ukoloff/win-ca#caveats
}
