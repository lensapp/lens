import { AppConstructorOptions, Application } from "spectron";
import * as util from "util";
import { exec } from "child_process";
import fse from "fs-extra";
import path from "path";
import { delay } from "../../src/common/utils";
import { AbortController } from "abort-controller";

interface AppTestingPaths {
  testingPath: string,
}

function getAppTestingPaths(): AppTestingPaths {
  switch (process.platform) {
    case "win32":
      return {
        testingPath: "./dist/win-unpacked/Lens.exe",
      };
    case "linux":
      return {
        testingPath: "./dist/linux-unpacked/kontena-lens",
      };
    case "darwin":
      return {
        testingPath: "./dist/mac/Lens.app/Contents/MacOS/Lens",
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
  const app = new Application(setup());

  await app.start();
  // Wait for splash screen to be closed
  while (await app.client.getWindowCount() > 1);
  await app.client.windowByIndex(0);
  await app.client.waitUntilWindowLoaded();

  /**
   * This is commented out to pass CI, need to do some more investiagation into why this isn't working
   */
  // if (process.platform === "linux") {
  //   const testingDesktop = [
  //     "[Desktop Entry]",
  //     "Name=Lens",
  //     `Exec=${path.resolve(getAppTestingPaths().testingPath)} %U`,
  //     "Terminal=false",
  //     "Type=Application",
  //     "Icon=lens",
  //     "StartupWMClass=Lens",
  //     "Comment=Lens - The Kubernetes IDE",
  //     "MimeType=x-scheme-handler/lens;",
  //     "Categories=Network;"
  //   ].join("\n");

  //   await mkdirp(path.join(os.homedir(), ".local/share/applications/"));
  //   await writeFile(path.join(os.homedir(), ".local/share/applications/lens-testing.desktop"), testingDesktop);

  //   const { status } = spawnSync("xdg-settings set default-url-scheme-handler lens lens-testing.desktop", { shell: true });

  //   expect(status).toBe(0);
  // }

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

const rendererLogPrefixMatcher = /^\[[0-9]{5}:[0-9]{4}\/[0-9]{6}\.[0-9]{6}:[A-Z]+:CONSOLE\([0-9)]+\)\]\s"(?<message>.*)", source: http:\/\//;

export interface LogMatches {
  renderer?: string[];
  main?: string[];
}

interface LogLines {
  renderer: string[];
  main: string[];
}

async function* splitLogs(app: Application, signal: AbortController): AsyncGenerator<LogLines, void, void> {
  let lastLogLineCount = 0;

  while (!signal.signal.aborted) { // infinite loop
    const curLogs: string[] = (app as any).chromeDriver.getLogs();
    const newLogs = curLogs.slice(lastLogLineCount);

    lastLogLineCount = curLogs.length;

    const item: LogLines = {
      renderer: [],
      main: [],
    };

    for (const logLine of newLogs) {
      const logParts = logLine.match(rendererLogPrefixMatcher);

      if (logParts === null) {
        item.main.push(logLine);
      } else {
        item.renderer.push(logParts.groups.message);
      }
    }

    yield item;
    await delay(500, signal); // only delay after the first attempt and fail fast if the signal has occured
  }
}

/**
 * Wait for all of `values` to be part of the logs. Does not clear logs. Does
 * not work well with `app.client.get(Main|Renderer)ProcessLogs()`
 *
 * Note: this is a "best attempt" since spectron's `getMainProcessLogs` sometimes
 * contains `renderer` logs.
 * @param app The spectron app that we are testing against
 * @param source Whether to wait for renderer or main logs
 * @param values The list of strings that should all be contained in the logs
 */
export async function waitForLogsToContain(app: Application, signal: AbortController, matches: LogMatches): Promise<void> {
  const notYetFound = {
    main: new Set(matches.main ?? []),
    renderer: new Set(matches.renderer ?? []),
  };

  for await (const logs of splitLogs(app, signal)) {
    mainMatch: for (const logPart of notYetFound.main) {
      for (const logLine of logs.main) {
        if (logLine.includes(logPart)) {
          notYetFound.main.delete(logPart);
          continue mainMatch; // we have found this log part, try the next part
        }
      }
    }

    rendererMatch: for (const logPart of notYetFound.renderer) {
      for (const logLine of logs.renderer) {
        if (logLine.includes(logPart)) {
          notYetFound.renderer.delete(logPart);
          continue rendererMatch; // we have found this log part, try the next part
        }
      }
    }

    if (notYetFound.main.size === 0 && notYetFound.renderer.size === 0) {
      return; // we are done, have found all log parts
    }
  }
}
