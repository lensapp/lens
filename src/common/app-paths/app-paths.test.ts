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
import type { DependencyInjectionContainer } from "@ogre-tools/injectable";
import { AppPaths, appPathsInjectionToken } from "./app-path-injection-token";
import getElectronAppPathInjectable from "../../main/app-paths/get-electron-app-path/get-electron-app-path.injectable";
import { getDisForUnitTesting } from "../../test-utils/get-dis-for-unit-testing";
import type { PathName } from "./app-path-names";
import setElectronAppPathInjectable from "../../main/app-paths/set-electron-app-path/set-electron-app-path.injectable";
import appNameInjectable from "../../main/app-paths/app-name/app-name.injectable";
import directoryForIntegrationTestingInjectable from "../../main/app-paths/directory-for-integration-testing/directory-for-integration-testing.injectable";
import path from "path";

describe("app-paths", () => {
  let mainDi: DependencyInjectionContainer;
  let rendererDi: DependencyInjectionContainer;
  let runSetups: () => Promise<void[]>;

  beforeEach(() => {
    const dis = getDisForUnitTesting({ doGeneralOverrides: true });

    mainDi = dis.mainDi;
    rendererDi = dis.rendererDi;
    runSetups = dis.runSetups;

    const defaultAppPathsStub: AppPaths = {
      appData: "some-app-data",
      cache: "some-cache",
      crashDumps: "some-crash-dumps",
      desktop: "some-desktop",
      documents: "some-documents",
      downloads: "some-downloads",
      exe: "some-exe",
      home: "some-home-path",
      logs: "some-logs",
      module: "some-module",
      music: "some-music",
      pictures: "some-pictures",
      recent: "some-recent",
      temp: "some-temp",
      videos: "some-videos",
      userData: "some-irrelevant",
    };

    mainDi.override(
      getElectronAppPathInjectable,
      () =>
        (key: PathName): string | null =>
          defaultAppPathsStub[key],
    );

    mainDi.override(
      setElectronAppPathInjectable,
      () =>
        (key: PathName, path: string): void => {
          defaultAppPathsStub[key] = path;
        },
    );

    mainDi.override(appNameInjectable, () => "some-app-name");
  });

  describe("normally", () => {
    beforeEach(async () => {
      await runSetups();
    });

    it("given in renderer, when injecting app paths, returns application specific app paths", () => {
      const actual = rendererDi.inject(appPathsInjectionToken);

      expect(actual).toEqual({
        appData: "some-app-data",
        cache: "some-cache",
        crashDumps: "some-crash-dumps",
        desktop: "some-desktop",
        documents: "some-documents",
        downloads: "some-downloads",
        exe: "some-exe",
        home: "some-home-path",
        logs: "some-logs",
        module: "some-module",
        music: "some-music",
        pictures: "some-pictures",
        recent: "some-recent",
        temp: "some-temp",
        videos: "some-videos",
        userData: "some-app-data/some-app-name",
      });
    });

    it("given in main, when injecting app paths, returns application specific app paths", () => {
      const actual = mainDi.inject(appPathsInjectionToken);

      expect(actual).toEqual({
        appData: "some-app-data",
        cache: "some-cache",
        crashDumps: "some-crash-dumps",
        desktop: "some-desktop",
        documents: "some-documents",
        downloads: "some-downloads",
        exe: "some-exe",
        home: "some-home-path",
        logs: "some-logs",
        module: "some-module",
        music: "some-music",
        pictures: "some-pictures",
        recent: "some-recent",
        temp: "some-temp",
        videos: "some-videos",
        userData: `some-app-data${path.sep}some-app-name`,
      });
    });
  });

  describe("when running integration tests", () => {
    beforeEach(async () => {
      mainDi.override(
        directoryForIntegrationTestingInjectable,
        () => "some-integration-testing-app-data",
      );

      await runSetups();
    });

    it("given in renderer, when injecting path for app data, has integration specific app data path", () => {
      const { appData, userData } = rendererDi.inject(appPathsInjectionToken);

      expect({ appData, userData }).toEqual({
        appData: "some-integration-testing-app-data",
        userData: `some-integration-testing-app-data${path.sep}some-app-name`,
      });
    });

    it("given in main, when injecting path for app data, has integration specific app data path", () => {
      const { appData, userData } = rendererDi.inject(appPathsInjectionToken);

      expect({ appData, userData }).toEqual({
        appData: "some-integration-testing-app-data",
        userData: `some-integration-testing-app-data${path.sep}some-app-name`,
      });
    });
  });
});
