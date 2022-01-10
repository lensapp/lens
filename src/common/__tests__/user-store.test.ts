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
import { Console } from "console";
import { SemVer } from "semver";
import electron from "electron";
import { stdout, stderr } from "process";
import type { ClusterStoreModel } from "../cluster-store";
import { AppPaths } from "../app-paths";
import { defaultTheme } from "../vars";

console = new Console(stdout, stderr);
AppPaths.init();

describe("user store tests", () => {
  describe("for an empty config", () => {
    beforeEach(() => {
      mockFs({ tmp: { "config.json": "{}", "kube_config": "{}" }});

      (UserStore.createInstance() as any).refreshNewContexts = jest.fn(() => Promise.resolve());
    });

    afterEach(() => {
      mockFs.restore();
      UserStore.resetInstance();
    });

    it("allows setting and retrieving lastSeenAppVersion", () => {
      const us = UserStore.getInstance();

      us.lastSeenAppVersion = "1.2.3";
      expect(us.lastSeenAppVersion).toBe("1.2.3");
    });

    it("allows setting and getting preferences", () => {
      const us = UserStore.getInstance();

      us.httpsProxy = "abcd://defg";

      expect(us.httpsProxy).toBe("abcd://defg");
      expect(us.colorTheme).toBe(defaultTheme);

      us.colorTheme = "light";
      expect(us.colorTheme).toBe("light");
    });

    it("correctly resets theme to default value", async () => {
      const us = UserStore.getInstance();

      us.colorTheme = "some other theme";
      us.resetTheme();
      expect(us.colorTheme).toBe(defaultTheme);
    });

    it("correctly calculates if the last seen version is an old release", () => {
      const us = UserStore.getInstance();

      expect(us.isNewVersion).toBe(true);

      us.lastSeenAppVersion = (new SemVer(electron.app.getVersion())).inc("major").format();
      expect(us.isNewVersion).toBe(false);
    });
  });

  describe("migrations", () => {
    beforeEach(() => {
      mockFs({
        "tmp": {
          "config.json": JSON.stringify({
            user: { username: "foobar" },
            preferences: { colorTheme: "light" },
            lastSeenAppVersion: "1.2.3",
          }),
          "lens-cluster-store.json": JSON.stringify({
            clusters: [
              {
                id: "foobar",
                kubeConfigPath: "tmp/extension_data/foo/bar",
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

      UserStore.createInstance();
    });

    afterEach(() => {
      UserStore.resetInstance();
      mockFs.restore();
    });

    it("sets last seen app version to 0.0.0", () => {
      const us = UserStore.getInstance();

      expect(us.lastSeenAppVersion).toBe("0.0.0");
    });

    it.only("skips clusters for adding to kube-sync with files under extension_data/", () => {
      const us = UserStore.getInstance();

      expect(us.syncKubeconfigEntries.has("tmp/extension_data/foo/bar")).toBe(false);
      expect(us.syncKubeconfigEntries.has("some/other/path")).toBe(true);
    });
  });
});
