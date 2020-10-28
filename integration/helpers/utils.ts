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
    env: {
      CICD: "true"
    }
  })
}

export async function tearDown(app: Application) {
  let mpid: any = app.mainProcess.pid
  let pid = await mpid()
  await app.stop()
  try {
    process.kill(pid, "SIGKILL");
  } catch (e) {
    console.error(e)
  }
}
