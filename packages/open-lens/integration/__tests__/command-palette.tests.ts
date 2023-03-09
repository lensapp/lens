/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ElectronApplication, Page } from "playwright";
import * as utils from "../helpers/utils";

describe("Lens command palette", () => {
  let window: Page;
  let cleanup: undefined | (() => Promise<void>);
  let app: ElectronApplication;

  beforeEach(async () => {
    ({ window, cleanup, app } = await utils.start());
    await utils.clickWelcomeButton(window);
  }, 10*60*1000);

  afterEach(async () => {
    await cleanup?.();
  }, 10*60*1000);

  describe("menu", () => {
    it("opens command dialog from menu", async () => {
      await app.evaluate(async ({ app }) => {
        await app.applicationMenu
          ?.getMenuItemById("view")
          ?.submenu?.getMenuItemById("open-command-palette")
          ?.click();
      });
      await window.waitForSelector(".Select__option >> text=Hotbar: Switch");
    }, 10*60*1000);
  });
});
