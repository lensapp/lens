import { Application } from "spectron";
import * as util from "util";
import { exec } from "child_process";

const AppPaths: Partial<Record<NodeJS.Platform, string>> = {
  "win32": "./dist/win-unpacked/OpenLens.exe",
  "linux": "./dist/linux-unpacked/open-lens",
  "darwin": "./dist/mac/OpenLens.app/Contents/MacOS/OpenLens",
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
  await showCatalog(app);

  return app;
}

export async function showCatalog(app: Application) {
  await app.client.waitUntilTextExists("[data-test-id=catalog-link]", "Catalog");
  await app.client.click("[data-test-id=catalog-link]");
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

export async function listHelmRepositories(): Promise<HelmRepository[]>{
  for (let i = 0; i < 10; i += 1) {
    try {
      const { stdout } = await promiseExec("helm repo list -o json");

      return JSON.parse(stdout);
    } catch {
      await new Promise(r => setTimeout(r, 2000)); // if no repositories, wait for Lens adding bitnami repository
    }
  }

  return [];
}
