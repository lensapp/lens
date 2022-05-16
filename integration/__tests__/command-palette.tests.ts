/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ElectronApplication, Page } from "playwright";
import * as utils from "../helpers/utils";
import { isWindows } from "../../src/common/vars";

describe("Lens command palette", () => {
  let window: Page, cleanup: () => Promise<void>, app: ElectronApplication;

  beforeEach(async () => {
    ({ window, cleanup, app } = await utils.start());
    await utils.clickWelcomeButton(window);
  }, 10*60*1000);

  afterEach(async () => {
    await cleanup();
  }, 10*60*1000);

  describe("menu", () => {
    // skip on windows due to suspected playwright issue with Electron 14
    utils.itIf(!isWindows)("opens command dialog from menu", async () => {
      await app.evaluate(async ({ app }) => {
        await app.applicationMenu
          ?.getMenuItemById("view")
          ?.submenu?.getMenuItemById("command-palette")
          ?.click();
      });
      await window.waitForSelector(".Select__option >> text=Hotbar: Switch");
    }, 10*60*1000);
  });
});
