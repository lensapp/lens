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

import { UserStore } from "../user-store";
import { SemVer } from "semver";
import electron from "electron";
import userStoreInjectable from "../user-store/user-store.injectable";
import type { DiContainer } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../app-paths/directory-for-user-data/directory-for-user-data.injectable";
import type { ClusterStoreModel } from "../cluster-store/cluster-store";
import writeFileInjectable from "../fs/write-file.injectable";
import { getDiForUnitTesting } from "../../main/getDiForUnitTesting";
import getConfigurationFileModelInjectable
  from "../get-configuration-file-model/get-configuration-file-model.injectable";
import appVersionInjectable
  from "../get-configuration-file-model/app-version/app-version.injectable";
import { defaultColorThemeConf, defaultTerminalThemeConf } from "../user-store/preferences-helpers";

console.log("This is a reminder to get rid of mockFs because it breaks console.log");

describe("user store tests", () => {
  let userStore: UserStore;
  let di: DiContainer;

  beforeEach(async () => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    mockFs();

    di.override(writeFileInjectable, () => () => undefined);
    di.override(directoryForUserDataInjectable, () => "some-directory-for-user-data");
    di.override(userStoreInjectable, () => UserStore.createInstance());

    di.permitSideEffects(getConfigurationFileModelInjectable);
    di.permitSideEffects(appVersionInjectable);

    await di.runSetups();
  });

  afterEach(() => {
    UserStore.resetInstance();
    mockFs.restore();
  });

  describe("for an empty config", () => {
    beforeEach(() => {
      mockFs({ "some-directory-for-user-data": { "config.json": "{}", "kube_config": "{}" }});

      userStore = di.inject(userStoreInjectable);
    });

    it("allows setting and retrieving lastSeenAppVersion", () => {
      userStore.lastSeenAppVersion = "1.2.3";
      expect(userStore.lastSeenAppVersion).toBe("1.2.3");
    });

    it("allows setting preferences", () => {
      userStore.httpsProxy = "abcd://defg";

      expect(userStore.httpsProxy).toBe("abcd://defg");
    });

    it("correctly resets theme to default value", async () => {
      (userStore.colorTheme as any) = "some other theme";
      userStore.resetThemeSettings();
      expect(userStore.colorTheme).toEqual(defaultColorThemeConf);
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

      userStore = di.inject(userStoreInjectable);
    });

    it("sets last seen app version to 0.0.0", () => {
      expect(userStore.lastSeenAppVersion).toBe("0.0.0");
    });

    it("skips clusters for adding to kube-sync with files under extension_data/", () => {
      expect(userStore.syncKubeconfigEntries.has("some-directory-for-user-data/extension_data/foo/bar")).toBe(false);
      expect(userStore.syncKubeconfigEntries.has("some/other/path")).toBe(true);
    });
  });

  describe("5.5.0-alpha.1 migrations", () => {
    it("given the invalid colorTheme setting of 'light', this migration resets value to default", () => {
      mockFs({
        "some-directory-for-user-data": {
          "lens-user-store.json": JSON.stringify({
            __internal__: {
              migrations: {
                version: "5.5.0-alpha.0",
              },
            },
            preferences: { colorTheme: "light" },
          }),
        },
      });

      userStore = di.inject(userStoreInjectable);
      expect(userStore.colorTheme).toEqual(defaultColorThemeConf);
    });
    it("given the invalid colorTheme setting of false, this migration resets value to default", () => {
      mockFs({
        "some-directory-for-user-data": {
          "lens-user-store.json": JSON.stringify({
            __internal__: {
              migrations: {
                version: "5.5.0-alpha.0",
              },
            },
            preferences: { colorTheme: false },
          }),
        },
      });

      userStore = di.inject(userStoreInjectable);
      expect(userStore.colorTheme).toEqual(defaultColorThemeConf);
    });

    it("given the colorTheme setting of 'system', this migration sets to tracking the system color theme type", () => {
      mockFs({
        "some-directory-for-user-data": {
          "lens-user-store.json": JSON.stringify({
            __internal__: {
              migrations: {
                version: "5.5.0-alpha.0",
              },
            },
            preferences: { colorTheme: "system" },
          }),
        },
      });

      userStore = di.inject(userStoreInjectable);
      expect(userStore.colorTheme).toEqual({
        followSystemThemeType: true,
        name: "lens",
      });
    });

    it("given the colorTheme setting of 'lens-light', this migration sets to the new format without loosing data", () => {
      mockFs({
        "some-directory-for-user-data": {
          "lens-user-store.json": JSON.stringify({
            __internal__: {
              migrations: {
                version: "5.5.0-alpha.0",
              },
            },
            preferences: { colorTheme: "lens-light" },
          }),
        },
      });

      userStore = di.inject(userStoreInjectable);
      expect(userStore.colorTheme).toEqual({
        followSystemThemeType: false,
        name: "lens",
        type: "light",
      });
    });

    it("given the terminalTheme setting of '', this migration sets to the new format of following lens theme", () => {
      mockFs({
        "some-directory-for-user-data": {
          "lens-user-store.json": JSON.stringify({
            __internal__: {
              migrations: {
                version: "5.5.0-alpha.0",
              },
            },
            preferences: { terminalTheme: "" },
          }),
        },
      });

      userStore = di.inject(userStoreInjectable);
      expect(userStore.terminalTheme).toEqual(defaultTerminalThemeConf);
    });

    it("given the invalid terminalTheme setting of 10, this migration sets to default", () => {
      mockFs({
        "some-directory-for-user-data": {
          "lens-user-store.json": JSON.stringify({
            __internal__: {
              migrations: {
                version: "5.5.0-alpha.0",
              },
            },
            preferences: { terminalTheme: 10 },
          }),
        },
      });

      userStore = di.inject(userStoreInjectable);
      expect(userStore.terminalTheme).toEqual(defaultTerminalThemeConf);
    });

    it("given the valid terminalTheme setting of 'lens-dark', this migration sets to the new format", () => {
      mockFs({
        "some-directory-for-user-data": {
          "lens-user-store.json": JSON.stringify({
            __internal__: {
              migrations: {
                version: "5.5.0-alpha.0",
              },
            },
            preferences: { terminalTheme: "lens-dark" },
          }),
        },
      });

      userStore = di.inject(userStoreInjectable);
      expect(userStore.terminalTheme).toEqual({
        isGlobalTheme: false,
        isGlobalThemeType: false,
        name: "lens",
        type: "dark",
      });
    });
  });
});
