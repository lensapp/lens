import { Application } from "spectron";
import { send, waitUntilTextExists } from "../helpers/client";
import * as utils from "../helpers/utils";

jest.setTimeout(60000);

describe("Lens command palette", () => {
  let app: Application;

  beforeEach(() => {
    console.debug(`startig: ${expect.getState().currentTestName}`);
  });

  describe("menu", () => {
    beforeAll(async () => app = await utils.appStart(), 20000);

    afterAll(async () => {
      if (app?.isRunning()) {
        await utils.tearDown(app);
      }
    });

    it("opens command dialog from menu", async () => {
      await utils.clickWhatsNew(app);
      await send(app.electron.ipcRenderer, "test-menu-item-click", "View", "Command Palette...");
      await waitUntilTextExists(app.client, ".Select__option", "Preferences: Open");
      await app.client.keys("Escape");
    });
  });
});
