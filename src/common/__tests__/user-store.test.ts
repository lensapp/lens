/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import mockFs from "mock-fs";
import { Console } from "console";
import { SemVer } from "semver";
import electron from "electron";
import { stdout, stderr } from "process";
import { getDisForUnitTesting } from "../../test-utils/get-dis-for-unit-testing";
import userPreferencesStoreInjectable from "../user-preferences/store.injectable";
import type { DependencyInjectionContainer } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../app-paths/directory-for-user-data.injectable";
import type { ClusterStoreModel } from "../cluster-store/store";
import { defaultTheme } from "../vars";
import type { UserPreferencesStore } from "../user-preferences";

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

console = new Console(stdout, stderr);

describe("user store tests", () => {
  let userStore: UserPreferencesStore;
  let mainDi: DependencyInjectionContainer;

  beforeEach(async () => {
    const dis = getDisForUnitTesting({ doGeneralOverrides: true });

    mockFs();

    mainDi = dis.mainDi;

    mainDi.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");

    await dis.runSetups();
  });

  afterEach(() => {
    mockFs.restore();
  });

  describe("for an empty config", () => {
    beforeEach(() => {
      mockFs({ "some-directory-for-user-data": { "config.json": "{}", "kube_config": "{}" }});

      userStore = mainDi.inject(userPreferencesStoreInjectable);
    });

    afterEach(() => {
      mockFs.restore();
    });

    it("allows setting and retrieving lastSeenAppVersion", () => {
      userStore.lastSeenAppVersion = "1.2.3";
      expect(userStore.lastSeenAppVersion).toBe("1.2.3");
    });

    it("allows setting and getting preferences", () => {
      userStore.httpsProxy = "abcd://defg";

      expect(userStore.httpsProxy).toBe("abcd://defg");
      expect(userStore.colorTheme).toBe(defaultTheme);

      userStore.colorTheme = "light";
      expect(userStore.colorTheme).toBe("light");
    });

    it("correctly resets theme to default value", () => {
      userStore.colorTheme = "some other theme";
      userStore.resetTheme();
      expect(userStore.colorTheme).toBe(defaultTheme);
    });

    it("correctly calculates if the last seen version is an old release", () => {
      expect(userStore.isNewVersion).toBe(true);

      userStore.lastSeenAppVersion = (new SemVer(electron.app.getVersion())).inc("major").format();
      expect(userStore.isNewVersion).toBe(false);
    });
  });

  describe("migrations", () => {
    beforeEach(() => {
      mockFs({
        "some-directory-for-user-data": {
          "config.json": JSON.stringify({
            user: { username: "foobar" },
            preferences: { colorTheme: "light" },
            lastSeenAppVersion: "1.2.3",
          }),
          "lens-cluster-store.json": JSON.stringify({
            clusters: [
              {
                id: "foobar",
                kubeConfigPath: "some-directory-for-user-data/extension_data/foo/bar",
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

      userStore = mainDi.inject(userPreferencesStoreInjectable);
    });

    afterEach(() => {
      mockFs.restore();
    });

    it("sets last seen app version to 0.0.0", () => {
      expect(userStore.lastSeenAppVersion).toBe("0.0.0");
    });

    it.only("skips clusters for adding to kube-sync with files under extension_data/", () => {
      expect(userStore.syncKubeconfigEntries.has("some-directory-for-user-data/extension_data/foo/bar")).toBe(false);
      expect(userStore.syncKubeconfigEntries.has("some/other/path")).toBe(true);
    });
  });
});
