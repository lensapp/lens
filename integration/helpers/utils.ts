import { Application } from "spectron";
import * as util from "util";
import { exec } from "child_process";

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

type HelmRepository = {
  name: string;
  url: string;
};
type AsyncPidGetter = () => Promise<number>;
export const promiseExec = util.promisify(exec);

export async function tearDown(app: Application) {
  const pid = await (app.mainProcess.pid as any as AsyncPidGetter)();

  await app.stop();

  try {
    process.kill(pid, "SIGKILL");
  } catch (e) {
    console.error(e);
  }
}

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
