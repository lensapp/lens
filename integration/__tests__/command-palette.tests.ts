import { setupAppLifecycle, clickWhatsNew } from "../helpers/utils";

jest.setTimeout(60000);

describe("Lens command palette", () => {
  const runtime = setupAppLifecycle();

  describe("menu", () => {
    it("opens command dialog from menu", async () => {
      await clickWhatsNew(runtime.app);
      await runtime.app.electron.ipcRenderer.send("test-menu-item-click", "View", "Command Palette...");
      await runtime.app.client.waitUntilTextExists(".Select__option", "Preferences: Open");
      await runtime.app.client.keys("Escape");
    });
  });
});
