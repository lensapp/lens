/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { AppPaths } from "./app-path-injection-token";
import { appPathsInjectionToken } from "./app-path-injection-token";
import getElectronAppPathInjectable from "../../main/app-paths/get-electron-app-path/get-electron-app-path.injectable";
import type { PathName } from "./app-path-names";
import setElectronAppPathInjectable from "../../main/app-paths/set-electron-app-path/set-electron-app-path.injectable";
import appNameInjectable from "../../main/app-paths/app-name/app-name.injectable";
import directoryForIntegrationTestingInjectable from "../../main/app-paths/directory-for-integration-testing/directory-for-integration-testing.injectable";
import type { ApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import type { DiContainer } from "@ogre-tools/injectable";

describe("app-paths", () => {
  let applicationBuilder: ApplicationBuilder;
  let rendererDi: DiContainer;
  let mainDi: DiContainer;

  beforeEach(() => {
    applicationBuilder = getApplicationBuilder();

    rendererDi = applicationBuilder.dis.rendererDi;
    mainDi = applicationBuilder.dis.mainDi;

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
      userData: "some-irrelevant-user-data",
    };

    applicationBuilder.beforeApplicationStart(({ mainDi }) => {
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
  });

  describe("normally", () => {
    beforeEach(async () => {
      await applicationBuilder.render();
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
        userData: "some-app-data/some-app-name",
      });
    });
  });

  describe("when running integration tests", () => {
    beforeEach(async () => {
      applicationBuilder.beforeApplicationStart(({ mainDi }) => {
        mainDi.override(
          directoryForIntegrationTestingInjectable,
          () => "some-integration-testing-app-data",
        );
      });

      await applicationBuilder.render();
    });

    it("given in renderer, when injecting path for app data, has integration specific app data path", () => {
      const { appData, userData } = rendererDi.inject(appPathsInjectionToken);

      expect({ appData, userData }).toEqual({
        appData: "some-integration-testing-app-data",
        userData: `some-integration-testing-app-data/some-app-name`,
      });
    });

    it("given in main, when injecting path for app data, has integration specific app data path", () => {
      const { appData, userData } = rendererDi.inject(appPathsInjectionToken);

      expect({ appData, userData }).toEqual({
        appData: "some-integration-testing-app-data",
        userData: "some-integration-testing-app-data/some-app-name",
      });
    });
  });
});
