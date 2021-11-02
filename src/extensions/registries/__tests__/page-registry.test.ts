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

import { ClusterPageRegistry, getExtensionPageUrl, GlobalPageRegistry, PageParams } from "../page-registry";
import { LensExtension } from "../../lens-extension";
import React from "react";
import fse from "fs-extra";
import { Console } from "console";
import { stdout, stderr } from "process";
import { ThemeStore } from "../../../renderer/theme.store";
import { TerminalStore } from "../../renderer-api/components";
import { UserStore } from "../../../common/user-store";
import { AppPaths } from "../../../common/app-paths";

jest.mock("react-monaco-editor", () => null);

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

AppPaths.init();

console = new Console(stdout, stderr);

let ext: LensExtension = null;

describe("page registry tests", () => {
  beforeEach(async () => {
    ext = new LensExtension({
      manifest: {
        name: "foo-bar",
        version: "0.1.1",
      },
      id: "/this/is/fake/package.json",
      absolutePath: "/absolute/fake/",
      manifestPath: "/this/is/fake/package.json",
      isBundled: false,
      isEnabled: true,
      isCompatible: true,
    });
    UserStore.createInstance();
    ThemeStore.createInstance();
    TerminalStore.createInstance();
    ClusterPageRegistry.createInstance();
    GlobalPageRegistry.createInstance().add({
      id: "page-with-params",
      components: {
        Page: () => React.createElement("Page with params"),
      },
      params: {
        test1: "test1-default",
        test2: "", // no default value, just declaration
      },
    }, ext);
    GlobalPageRegistry.createInstance().add([
      {
        id: "test-page",
        components: {
          Page: () => React.createElement("Text"),
        },
      },
      {
        id: "another-page",
        components: {
          Page: () => React.createElement("Text"),
        },
      },
      {
        components: {
          Page: () => React.createElement("Default"),
        },
      },
    ], ext);
  });

  afterEach(() => {
    GlobalPageRegistry.resetInstance();
    ClusterPageRegistry.resetInstance();
    TerminalStore.resetInstance();
    ThemeStore.resetInstance();
    UserStore.resetInstance();
    fse.remove("tmp");
  });

  describe("getPageUrl", () => {
    it("returns a page url for extension", () => {
      expect(getExtensionPageUrl({ extensionId: ext.name })).toBe("/extension/foo-bar");
    });

    it("allows to pass base url as parameter", () => {
      expect(getExtensionPageUrl({ extensionId: ext.name, pageId: "/test" })).toBe("/extension/foo-bar/test");
    });

    it("removes @ and replace `/` to `--`", () => {
      expect(getExtensionPageUrl({ extensionId: "@foo/bar" })).toBe("/extension/foo--bar");
    });

    it("adds / prefix", () => {
      expect(getExtensionPageUrl({ extensionId: ext.name, pageId: "test" })).toBe("/extension/foo-bar/test");
    });

    it("normalize possible multi-slashes in page.id", () => {
      expect(getExtensionPageUrl({ extensionId: ext.name, pageId: "//test/" })).toBe("/extension/foo-bar/test");
    });

    it("gets page url with custom params", () => {
      const params: PageParams = { test1: "one", test2: "2" };
      const searchParams = new URLSearchParams(params);
      const pageUrl = getExtensionPageUrl({
        extensionId: ext.name,
        pageId: "page-with-params",
        params,
      });

      expect(pageUrl).toBe(`/extension/foo-bar/page-with-params?${searchParams}`);
    });

    it("gets page url with default custom params", () => {
      const defaultPageUrl = getExtensionPageUrl({
        extensionId: ext.name,
        pageId: "page-with-params",
      });

      expect(defaultPageUrl).toBe(`/extension/foo-bar/page-with-params?test1=test1-default`);
    });
  });

  describe("globalPageRegistry", () => {
    describe("getByPageTarget", () => {
      it("matching to first registered page without id", () => {
        const page = GlobalPageRegistry.getInstance().getByPageTarget({ extensionId: ext.name });

        expect(page.id).toEqual(undefined);
        expect(page.extensionId).toEqual(ext.name);
        expect(page.url).toEqual(getExtensionPageUrl({ extensionId: ext.name }));
      });

      it("returns matching page", () => {
        const page = GlobalPageRegistry.getInstance().getByPageTarget({
          pageId: "test-page",
          extensionId: ext.name,
        });

        expect(page.id).toEqual("test-page");
      });

      it("returns null if target not found", () => {
        const page = GlobalPageRegistry.getInstance().getByPageTarget({
          pageId: "wrong-page",
          extensionId: ext.name,
        });

        expect(page).toBeNull();
      });
    });
  });
});
