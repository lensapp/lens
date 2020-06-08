import { Application } from "spectron";
import * as path from "path"

let appPath = ""
switch(process.platform) {
case "win32":
  appPath = path.join("./dist/win-unpacked/Lens.exe")
  break
case "linux":
  appPath = path.join("./dist/linux-unpacked/kontena-lens")
  break
case "darwin":
  appPath = path.join("./dist/mac/LensDev.app/Contents/MacOS/LensDev")
  break
}

export function setup() {
  return new Application({
    // path to electron app
    args: [],
    path: appPath,
    startTimeout: 30000,
    waitTimeout: 30000,
  })
}

export async function tearDown(app: Application) {
  const pid = app.mainProcess.pid
  await app.stop()
  try {
    process.kill(pid, 0);
  } catch(e) {
    return
  }
}
