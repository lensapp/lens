import * as winca from "win-ca/api"
import "mac-ca"

if (process.platform === "win32") {
  winca.inject("+") // see: https://github.com/ukoloff/win-ca#caveats
}
