import { Application } from "spectron";

const AppPaths: Partial<Record<NodeJS.Platform, string>> = {
  "win32": "./dist/win-unpacked/Lens.exe",
  "linux": "./dist/linux-unpacked/kontena-lens",
  "darwin": "./dist/mac/Lens.app/Contents/MacOS/Lens",
}

export function setup(): Application {
  return new Application({
    // path to electron app
    args: [],
    path: AppPaths[process.platform],
    startTimeout: 30000,
    waitTimeout: 60000,
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
  } catch (e) {
    return
  }
}
