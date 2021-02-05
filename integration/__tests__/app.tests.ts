import { Application } from "spectron";
import * as utils from "../helpers/utils";
import { listHelmRepositories } from "../helpers/utils";
import { fail } from "assert";
import { click, send, waitUntilTextExists } from "../helpers/client";


jest.setTimeout(60000);

// FIXME (!): improve / simplify all css-selectors + use [data-test-id="some-id"] (already used in some tests below)
describe("Lens integration tests", () => {
  let app: Application;

  beforeEach(() => {
    console.debug(`startig: ${expect.getState().currentTestName}`);
  });

  describe("app start", () => {
    beforeAll(async () => app = await utils.appStart(), 20000);

    afterAll(async () => {
      if (app?.isRunning()) {
        await utils.tearDown(app);
      }
    });

    it('shows "whats new"', async () => {
      await utils.clickWhatsNew(app);
    });

    it('shows "add cluster"', async () => {
      send(app.electron.ipcRenderer, "test-menu-item-click", "File", "Add Cluster");
      await waitUntilTextExists(app.client, "h2", "Add Cluster");
    });

    describe("preferences page", () => {
      it('shows "preferences"', async () => {
        const appName: string = process.platform === "darwin" ? "Lens" : "File";

        send(app.electron.ipcRenderer, "test-menu-item-click", appName, "Preferences");
        await waitUntilTextExists(app.client, "h2", "Preferences");
      });

      it("ensures helm repos", async () => {
        const repos = await listHelmRepositories();

        if (!repos[0]) {
          fail("Lens failed to add Bitnami repository");
        }

        await waitUntilTextExists(app.client, "div.repos #message-bitnami", repos[0].name); // wait for the helm-cli to fetch the repo(s)
        await click(app.client, "#HelmRepoSelect"); // click the repo select to activate the drop-down
        await waitUntilTextExists(app.client, "div.Select__option", "");  // wait for at least one option to appear (any text)
      });
    });

    it.skip('quits Lens"', async () => {
      await app.client.keys(["Meta", "Q"]);
      await app.client.keys("Meta");
    });
  });
});
