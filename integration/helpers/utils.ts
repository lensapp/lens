/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createHash } from "crypto";
import { mkdirp, remove } from "fs-extra";
import * as os from "os";
import * as path from "path";
import * as uuid from "uuid";
import type { ElectronApplication, Frame, Page } from "playwright";
import { _electron as electron } from "playwright";
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

async function attemptStart() {
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

export async function start() {
  // this is an attempted workaround for an issue with playwright not always getting the main window when using Electron 14.2.4 (observed on windows)
  for (let i = 0; ; i++) {
    try {
      return await attemptStart();
    } catch (error) {
      if (i === 4) {
        throw error;
      }
    }
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

  if (!frame) {
    throw new Error("No iframe for minikube found");
  }

  await frame.waitForSelector("[data-testid=cluster-sidebar]");

  return frame;
}
