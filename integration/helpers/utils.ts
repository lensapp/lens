/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
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
export function wrapJestLifecycle(fn: () => Promise<void> | void): (done: DoneCallback) => void {
  return function (done: DoneCallback) {
    (async () => fn())()
      .then(() => done())
      .catch(error => done.fail(error));
  };
}

export function beforeAllWrapped(fn: () => Promise<void> | void): void {
  beforeAll(wrapJestLifecycle(fn));
}

export function beforeEachWrapped(fn: () => Promise<void> | void): void {
  beforeEach(wrapJestLifecycle(fn));
}

export function afterAllWrapped(fn: () => Promise<void> | void): void {
  afterAll(wrapJestLifecycle(fn));
}

export function afterEachWrapped(fn: () => Promise<void> | void): void {
  afterEach(wrapJestLifecycle(fn));
}

export function itIf(condition: boolean) {
  return condition ? it : it.skip;
}

export function describeIf(condition: boolean) {
  return condition ? describe : describe.skip;
}

export const keys = {
  backspace: "\uE003"
};

export async function setup(): Promise<Application> {
  const app =  new Application({
    path: AppPaths[process.platform], // path to electron app
    args: [],
    startTimeout: 60000,
    waitTimeout: 10000,
    env: {
      CICD: "true"
    }
  });

  await app.start();
  // Wait for splash screen to be closed
  while (await app.client.getWindowCount() > 1);
  await app.client.windowByIndex(0);
  await app.client.waitUntilWindowLoaded();
  await showCatalog(app);

  return app;
}

export async function showCatalog(app: Application) {
  await app.client.waitForExist("#hotbarIcon-catalog-entity .Icon");
  await app.client.click("#hotbarIcon-catalog-entity .Icon");
}

type AsyncPidGetter = () => Promise<number>;

export async function tearDown(app?: Application) {
  if (!app?.isRunning()) {
    return;
  }

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
