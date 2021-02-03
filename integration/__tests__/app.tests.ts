import { Application } from "spectron";
import * as utils from "../helpers/utils";
import { listHelmRepositories } from "../helpers/utils";
import { fail } from "assert";
import open from "open";
import { AbortController } from "abort-controller";

jest.setTimeout(60000);

// FIXME (!): improve / simplify all css-selectors + use [data-test-id="some-id"] (already used in some tests below)
describe("Lens integration tests", () => {
  let app: Application;
  let abortContoller: AbortController;

  describe("app start", () => {
    beforeAll(async () => {
      app = await utils.appStart();
    }, 20000);

    beforeEach(() => {
      abortContoller = new AbortController();
    });

    afterAll(async () => {
      if (app?.isRunning()) {
        await utils.tearDown(app);
      }
    });

    afterEach(() => {
      abortContoller.abort();
    });

    it('shows "whats new"', async () => {
      await utils.clickWhatsNew(app);
    });

    it('shows "add cluster"', async () => {
      await app.electron.ipcRenderer.send("test-menu-item-click", "File", "Add Cluster");
      await app.client.waitUntilTextExists("h2", "Add Cluster");
    });

    /**
     * skipping this for the time being until we can figure out why they are opening a second instace
     * and seemingly bypassing the single instance lock
     */
    describe.skip("protocol app start", () => {
      it("should handle opening lens:// links", async () => {
        await open("lens://app/foobar");

        await utils.waitForLogsToContain(app, abortContoller, {
          main: ["No handler", "lens://app/foobar"],
          renderer: ["No handler", "lens://app/foobar"],
        });
      });

      it("should opening lens://app/preferences", async () => {
        await open("lens://app/preferences");
        await app.client.waitUntilTextExists("h2", "Preferences");
      });
    });

    describe("preferences page", () => {
      it('shows "preferences"', async () => {
        const appName: string = process.platform === "darwin" ? "Lens" : "File";

        await app.electron.ipcRenderer.send("test-menu-item-click", appName, "Preferences");
        await app.client.waitUntilTextExists("h2", "Preferences");
      });

      it("ensures helm repos", async () => {
        const repos = await listHelmRepositories();

        if (!repos[0]) {
          fail("Lens failed to add Bitnami repository");
        }

        await app.client.waitUntilTextExists("div.repos #message-bitnami", repos[0].name); // wait for the helm-cli to fetch the repo(s)
        await app.client.click("#HelmRepoSelect"); // click the repo select to activate the drop-down
        await app.client.waitUntilTextExists("div.Select__option", "");  // wait for at least one option to appear (any text)
      });
    });

    it.skip('quits Lens"', async () => {
      await app.client.keys(["Meta", "Q"]);
      await app.client.keys("Meta");
    });
  });
});
