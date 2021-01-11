import { AppConstructorOptions, Application } from "spectron";
import * as util from "util";
import { exec } from "child_process";
import fse from "fs-extra";
import path from "path";

interface AppTestingPaths {
  testingPath: string,
  libraryPath: string,
}

function getAppTestingPaths(): AppTestingPaths {
  switch (process.platform) {
    case "win32":
      return {
        testingPath: "./dist/win-unpacked/Lens.exe",
        libraryPath: path.join(process.env.APPDATA, "Lens"),
      };
    case "linux":
      return {
        testingPath: "./dist/linux-unpacked/lens",
        libraryPath: path.join(process.env.XDG_CONFIG_HOME || path.join(process.env.HOME, ".config"), "Lens"),
      };
    case "darwin":
      return {
        testingPath: "./dist/mac/Lens.app/Contents/MacOS/Lens",
        libraryPath: path.join(process.env.HOME, "Library/Application\ Support/Lens"),
      };
    default:
      throw new TypeError(`platform ${process.platform} is not supported`);
  }
}

export function itIf(condition: boolean) {
  return condition ? it : it.skip;
}

export function describeIf(condition: boolean) {
  return condition ? describe : describe.skip;
}

export function setup(): AppConstructorOptions {
  const appPath = getAppTestingPaths();

  fse.removeSync(appPath.libraryPath); // remove old install config

  return {
    path: appPath.testingPath,
    args: [],
    startTimeout: 30000,
    waitTimeout: 60000,
    env: {
      CICD: "true"
    }
  };
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
