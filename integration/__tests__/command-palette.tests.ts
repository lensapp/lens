import { Application } from "spectron";
import * as utils from "../helpers/utils";

jest.setTimeout(60000);

describe("Lens command palette", () => {
  let app: Application;

  describe("menu", () => {
    beforeAll(utils.wrapJestLifecycle(async () => {
      app = await utils.appStart();
    }));

    afterAll(utils.wrapJestLifecycle(async () => {
      if (app?.isRunning()) {
        await utils.tearDown(app);
      }
    }));

    it("opens command dialog from menu", async () => {
      await utils.clickWhatsNew(app);
      await app.electron.ipcRenderer.send("test-menu-item-click", "View", "Command Palette...");
      await app.client.waitUntilTextExists(".Select__option", "Preferences: Open");
      await app.client.keys("Escape");
    });
  });
});
