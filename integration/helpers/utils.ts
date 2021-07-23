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
import * as util from "util";
import { exec } from "child_process";
import { Frame, Page, _electron as electron } from "playwright";

export const AppPaths: Partial<Record<NodeJS.Platform, string>> = {
  "win32": "./dist/win-unpacked/OpenLens.exe",
  "linux": "./dist/linux-unpacked/open-lens",
  "darwin": "./dist/mac/OpenLens.app/Contents/MacOS/OpenLens",
};

export function itIf(condition: boolean) {
  return condition ? it : it.skip;
}

export function describeIf(condition: boolean) {
  return condition ? describe : describe.skip;
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

export async function start() {
  const app = await electron.launch({
    args: ["--integration-testing"], // this argument turns off the blocking of quit
    executablePath: AppPaths[process.platform],
    bypassCSP: true,
  });

  const window = await app.waitForEvent("window", {
    predicate: async (page) => page.url().startsWith("http://localhost"),
  });

  return {
    app,
    window,
    cleanup: async () => {
      await window.close();
      await app.close();
    },
  };
}

export async function clickWelcomeButton(window: Page) {
  await window.click("#hotbarIcon-catalog-entity .Icon");
}

/**
 * From the catalog, click the minikube entity and wait for it to connect, returning its frame
 */
export async function lauchMinikubeClusterFromCatalog(window: Page): Promise<Frame> {
  await window.waitForSelector("div.TableCell");
  await window.click("div.TableCell >> text='minikube'");
  await window.waitForSelector("div.drawer-title-text >> text='KubernetesCluster: minikube'");
  await window.click("div.EntityIcon div.HotbarIcon div div.MuiAvatar-root");

  const minikubeFrame = await window.waitForSelector("#cluster-frame-484e864bad9b84ce5d6b4fff704cc0e4");

  const frame = await minikubeFrame.contentFrame();

  await frame.waitForSelector("div.Sidebar");

  return frame;
}
