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
import { createHash } from "crypto";
import { mkdirp, remove } from "fs-extra";
import * as os from "os";
import * as path from "path";
import * as uuid from "uuid";
import { ElectronApplication, Frame, Page, _electron as electron } from "playwright";
import { noop } from "lodash";

export const appPaths: Partial<Record<NodeJS.Platform, string>> = {
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

async function getMainWindow(app: ElectronApplication, timeout = 50_000): Promise<Page> {
  const deadline = Date.now() + timeout;

  for (; Date.now() < deadline;) {
    for (const page of app.windows()) {
      if (page.url().startsWith("http://localhost")) {
        return page;
      }
    }

    await new Promise(resolve => setTimeout(resolve, 2_000));
  }

  throw new Error(`Lens did not open the main window within ${timeout}ms`);
}

export async function start() {
  const CICD = path.join(os.tmpdir(), "lens-integration-testing", uuid.v4());

  // Make sure that the directory is clear
  await remove(CICD).catch(noop);
  await mkdirp(CICD);

  const app = await electron.launch({
    args: ["--integration-testing"], // this argument turns off the blocking of quit
    executablePath: appPaths[process.platform],
    bypassCSP: true,
    env: {
      CICD,
      ...process.env,
    },
    timeout: 100_000,
  } as Parameters<typeof electron["launch"]>[0]);

  try {
    const window = await getMainWindow(app);

    return {
      app,
      window,
      cleanup: async () => {
        await app.close();
        await remove(CICD).catch(noop);
      },
    };
  } catch (error) {
    await app.close();
    await remove(CICD).catch(noop);
    throw error;
  }
}

export async function clickWelcomeButton(window: Page) {
  await window.click("[data-testid=welcome-menu-container] li a");
}

function minikubeEntityId() {
  return createHash("md5").update(`${path.join(os.homedir(), ".kube", "config")}:minikube`).digest("hex");
}

/**
 * From the catalog, click the minikube entity and wait for it to connect, returning its frame
 */
export async function lauchMinikubeClusterFromCatalog(window: Page): Promise<Frame> {
  await window.click("div.TableCell >> text='minikube'");

  const minikubeFrame = await window.waitForSelector(`#cluster-frame-${minikubeEntityId()}`);

  const frame = await minikubeFrame.contentFrame();

  await frame.waitForSelector("[data-testid=cluster-sidebar]");

  return frame;
}
