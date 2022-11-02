/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import mockFs from "mock-fs";

jest.mock("electron", () => ({
  app: {
    getVersion: () => "99.99.99",
    getName: () => "lens",
    setName: jest.fn(),
    setPath: jest.fn(),
    getPath: () => "tmp",
    getLocale: () => "en",
    setLoginItemSettings: jest.fn(),
  },
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn(),
  },
}));

import type { UserStore } from "../user-store";
import { Console } from "console";
import { stdout, stderr } from "process";
import userStoreInjectable from "../user-store/user-store.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import type { ClusterStoreModel } from "../cluster-store/cluster-store";
import { defaultThemeId } from "../vars";
import writeFileInjectable from "../fs/write-file.injectable";
import { getDiForUnitTesting } from "../../main/getDiForUnitTesting";
import getConfigurationFileModelInjectable from "../get-configuration-file-model/get-configuration-file-model.injectable";
import storeMigrationVersionInjectable from "../vars/store-migration-version.injectable";
import { beforeApplicationIsLoadingInjectionToken } from "../../main/start-main-application/runnable-tokens/before-application-is-loading-injection-token";
import { beforeElectronIsReadyInjectionToken } from "../../main/start-main-application/runnable-tokens/before-electron-is-ready-injection-token";
import { runManyFor } from "../runnable/run-many-for";
import { runManySyncFor } from "../runnable/run-many-sync-for";

console = new Console(stdout, stderr);

describe("user store tests", () => {
  let userStore: UserStore;
  let di: DiContainer;

  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    mockFs();

    di.override(writeFileInjectable, () => () => Promise.resolve());

    di.permitSideEffects(getConfigurationFileModelInjectable);
    di.permitSideEffects(userStoreInjectable);

    di.unoverride(userStoreInjectable);

    const runManySync = runManySyncFor(di);
    const runAllBeforeElectronIsReady = runManySync(beforeElectronIsReadyInjectionToken);

    runAllBeforeElectronIsReady();
  });

  afterEach(() => {
    mockFs.restore();
  });

  describe("for an empty config", () => {
    beforeEach(async () => {
      mockFs({ "/some-electron-app-path-for-user-data": { "config.json": "{}", "kube_config": "{}" }});

      userStore = di.inject(userStoreInjectable);

      const runMany = runManyFor(di);
      const runAllBeforeApplicationIsLoading = runMany(beforeApplicationIsLoadingInjectionToken);

      await runAllBeforeApplicationIsLoading();
    });

    it("allows setting and retrieving lastSeenAppVersion", () => {
      userStore.lastSeenAppVersion = "1.2.3";
      expect(userStore.lastSeenAppVersion).toBe("1.2.3");
    });

    it("allows setting and getting preferences", () => {
      userStore.httpsProxy = "abcd://defg";

      expect(userStore.httpsProxy).toBe("abcd://defg");
      expect(userStore.colorTheme).toBe(defaultThemeId);

      userStore.colorTheme = "light";
      expect(userStore.colorTheme).toBe("light");
    });

    it("correctly resets theme to default value", async () => {
      userStore.colorTheme = "some other theme";
      userStore.resetTheme();
      expect(userStore.colorTheme).toBe(defaultThemeId);
    });
  });

  describe("migrations", () => {
    beforeEach(async () => {
      mockFs({
        "/some-electron-app-path-for-user-data": {
          "config.json": JSON.stringify({
            user: { username: "foobar" },
            preferences: { colorTheme: "light" },
            lastSeenAppVersion: "1.2.3",
          }),
          "lens-cluster-store.json": JSON.stringify({
            clusters: [
              {
                id: "foobar",
                kubeConfigPath: "/some-electron-app-path-for-user-data/extension_data/foo/bar",
              },
              {
                id: "barfoo",
                kubeConfigPath: "some/other/path",
              },
            ],
          } as ClusterStoreModel),
          "extension_data": {},
        },
        "some": {
          "other": {
            "path": "is file",
          },
        },
      });

      di.override(storeMigrationVersionInjectable, () => "10.0.0");

      userStore = di.inject(userStoreInjectable);

      const runMany = runManyFor(di);
      const runAllBeforeApplicationIsLoading = runMany(beforeApplicationIsLoadingInjectionToken);

      await runAllBeforeApplicationIsLoading();
    });

    it("sets last seen app version to 0.0.0", () => {
      expect(userStore.lastSeenAppVersion).toBe("0.0.0");
    });

    it("skips clusters for adding to kube-sync with files under extension_data/", () => {
      expect(userStore.syncKubeconfigEntries.has("/some-electron-app-path-for-user-data/extension_data/foo/bar")).toBe(false);
      expect(userStore.syncKubeconfigEntries.has("some/other/path")).toBe(true);
    });
  });
});
