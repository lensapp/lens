import { clickWhatsNew, listHelmRepositories, setupAppLifecycle } from "../helpers";

jest.setTimeout(60000);

describe("App start", () => {
  const runtime = setupAppLifecycle();

  it('shows "whats new"', async () => {
    await clickWhatsNew(runtime.app);
  });

  it('shows "add cluster"', async () => {
    await runtime.app.electron.ipcRenderer.send("test-menu-item-click", "File", "Add Cluster");
    await runtime.app.client.waitUntilTextExists("h2", "Add Cluster");
  });

  describe("preferences page", () => {
    it('shows "preferences"', async () => {
      const appName: string = process.platform === "darwin" ? "Lens" : "File";

      await runtime.app.electron.ipcRenderer.send("test-menu-item-click", appName, "Preferences");
      await runtime.app.client.waitUntilTextExists("h2", "Preferences");
    });

    it("ensures helm repos", async () => {
      const repos = await listHelmRepositories();

      if (!repos[0]) {
        fail("Lens failed to add Bitnami repository");
      }

      await runtime.app.client.waitUntilTextExists("div.repos #message-bitnami", repos[0].name); // wait for the helm-cli to fetch the repo(s)
      await runtime.app.client.click("#HelmRepoSelect"); // click the repo select to activate the drop-down
      await runtime.app.client.waitUntilTextExists("div.Select__option", "");  // wait for at least one option to appear (any text)
    });
  });

  it.skip('quits Lens"', async () => {
    await runtime.app.client.keys(["Meta", "Q"]);
    await runtime.app.client.keys("Meta");
  });
});
