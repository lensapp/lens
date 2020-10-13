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
  const pid = app.mainProcess.pid
  let ppid: any = pid
  ppid = await ppid()
  await app.stop()
  try {
    process.kill(ppid, "SIGKILL");
  } catch (e) {
    console.error(e)
  }
}
