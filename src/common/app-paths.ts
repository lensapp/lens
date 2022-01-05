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

import { app, ipcMain, ipcRenderer } from "electron";
import { observable, when } from "mobx";
import path from "path";
import logger from "./logger";
import { fromEntries } from "./utils/objects";
import { toJS } from "./utils/toJS";
import { isWindows } from "./vars";

export type PathName = Parameters<typeof app["getPath"]>[0];

const pathNames: PathName[] = [
  "home",
  "appData",
  "userData",
  "cache",
  "temp",
  "exe",
  "module",
  "desktop",
  "documents",
  "downloads",
  "music",
  "pictures",
  "videos",
  "logs",
  "crashDumps",
];

if (isWindows) {
  pathNames.push("recent");
}

export class AppPaths {
  private static paths = observable.box<Record<PathName, string> | undefined>();
  private static readonly ipcChannel = "get-app-paths";

  /**
   * Initializes the local copy of the paths from electron.
   */
  static async init(): Promise<void> {
    logger.info(`[APP-PATHS]: initializing`);

    if (AppPaths.paths.get()) {
      return void logger.error("[APP-PATHS]: init called more than once");
    }

    if (ipcMain) {
      AppPaths.initMain();
    } else {
      await AppPaths.initRenderer();
    }
  }

  private static initMain(): void {
    if (process.env.CICD) {
      app.setPath("appData", process.env.CICD);
    }

    app.setPath("userData", path.join(app.getPath("appData"), app.getName()));

    const getPath = (pathName: PathName) => {
      try {
        return app.getPath(pathName);
      } catch {
        logger.debug(`[APP-PATHS] No path found for ${pathName}`);

        return "";
      }
    };

    AppPaths.paths.set(fromEntries(pathNames.map(pathName => [pathName, getPath(pathName)] as const).filter(([, path]) => path)));
    ipcMain.handle(AppPaths.ipcChannel, () => toJS(AppPaths.paths.get()));
  }

  private static async initRenderer(): Promise<void> {
    const paths = await ipcRenderer.invoke(AppPaths.ipcChannel);

    if (!paths || typeof paths !== "object") {
      throw Object.assign(new Error("[APP-PATHS]: ipc handler returned unexpected data"), { data: paths });
    }

    AppPaths.paths.set(paths);
  }

  /**
   * An alternative to `app.getPath()` for use in renderer and common.
   * This function throws if called before initialization.
   * @param name The name of the path field
   */
  static get(name: PathName): string {
    if (!AppPaths.paths.get()) {
      throw new Error("AppPaths.init() has not been called");
    }

    return AppPaths.paths.get()[name];
  }

  /**
   * An async version of `AppPaths.get()` which waits for `AppPaths.init()` to
   * be called before returning
   */
  static async getAsync(name: PathName): Promise<string> {
    await when(() => Boolean(AppPaths.paths.get()));

    return AppPaths.paths.get()[name];
  }
}
