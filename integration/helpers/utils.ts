import { Application } from "spectron";

const AppPaths: Partial<Record<NodeJS.Platform, string>> = {
  "win32": "./dist/win-unpacked/Lens.exe",
  "linux": "./dist/linux-unpacked/kontena-lens",
  "darwin": "./dist/mac/Lens.app/Contents/MacOS/Lens",
};

export function itIf(condition: boolean) {
  return condition ? it : it.skip;
}

export function describeIf(condition: boolean) {
  return condition ? describe : describe.skip;
}

export function setup(): Application {
  return new Application({
    path: AppPaths[process.platform], // path to electron app
    args: [],
    startTimeout: 30000,
    waitTimeout: 60000,
    env: {
      CICD: "true"
    }
  });
}

export const keys = {
  backspace: "\uE003"
};

export async function appStart() {
  const app = setup();

  await app.start();
  // Wait for splash screen to be closed
  while (await app.client.getWindowCount() > 1);
  await app.client.windowByIndex(0);
  await app.client.waitUntilWindowLoaded();

  return app;
}

export async function clickWhatsNew(app: Application) {
  await app.client.waitUntilTextExists("h1", "What's new?");
  await app.client.click("button.primary");
  await app.client.waitUntilTextExists("h1", "Welcome");
}

type AsyncPidGetter = () => Promise<number>;

export async function tearDown(app: Application) {
  const pid = await (app.mainProcess.pid as any as AsyncPidGetter)();

  await app.stop();

  try {
    process.kill(pid, "SIGKILL");
  } catch (e) {
    console.error(e);
  }
}
