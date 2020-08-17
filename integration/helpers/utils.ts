import { Application } from "spectron";

let appPath = ""
switch(process.platform) {
case "win32":
  appPath = "./dist/win-unpacked/Lens.exe"
  break
case "linux":
  appPath = "./dist/linux-unpacked/kontena-lens"
  break
case "darwin":
  appPath = "./dist/mac/Lens.app/Contents/MacOS/Lens"
  break
}

export function setup(): Application {
  return new Application({
    // path to electron app
    args: [],
    path: appPath,
    startTimeout: 30000,
    waitTimeout: 30000,
    chromeDriverArgs: ['remote-debugging-port=9222'],
    env: {
      CICD: "true"
    }
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
