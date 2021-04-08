import { Application } from "spectron";
import * as util from "util";
import { exec } from "child_process";

const AppPaths: Partial<Record<NodeJS.Platform, string>> = {
  "win32": "./dist/win-unpacked/Lens.exe",
  "linux": "./dist/linux-unpacked/kontena-lens",
  "darwin": "./dist/mac/Lens.app/Contents/MacOS/Lens",
};

interface DoneCallback {
  (...args: any[]): any;
  fail(error?: string | { message: string }): any;
}

/**
 * This is necessary because Jest doesn't do this correctly.
 * @param fn The function to call
 */
export function wrapJestLifecycle(fn: () => Promise<void>): (done: DoneCallback) => void {
  return function (done: DoneCallback) {
    fn()
      .then(() => done())
      .catch(error => done.fail(error));
  };
}

export function beforeAllWrapped(fn: () => Promise<void>): void {
  beforeAll(wrapJestLifecycle(fn));
}

export function beforeEachWrapped(fn: () => Promise<void>): void {
  beforeEach(wrapJestLifecycle(fn));
}

export function afterAllWrapped(fn: () => Promise<void>): void {
  afterAll(wrapJestLifecycle(fn));
}

export function afterEachWrapped(fn: () => Promise<void>): void {
  afterEach(wrapJestLifecycle(fn));
}

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
  await app.client.waitUntilTextExists("div", "Catalog");
}

export async function clickWelcomeNotification(app: Application) {
  const itemsText = await app.client.$("div.info-panel").getText();

  if (itemsText === "0 item") {
    // welcome notification should be present, dismiss it
    await app.client.waitUntilTextExists("div.message", "Welcome!");
    await app.client.click(".notification i.Icon.close");
  }
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

export const promiseExec = util.promisify(exec);

type HelmRepository = {
  name: string;
  url: string;
};

export async function listHelmRepositories(retries = 0):  Promise<HelmRepository[]>{
  if (retries < 5) {
    try {
      const { stdout: reposJson } = await promiseExec("helm repo list -o json");

      return JSON.parse(reposJson);
    } catch {
      await new Promise(r => setTimeout(r, 2000)); // if no repositories, wait for Lens adding bitnami repository

      return await listHelmRepositories((retries + 1));
    }
  }

  return [];
}
