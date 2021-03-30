/**
 * @jest-environment node
 */

/*
  Cluster tests are run if there is a pre-existing minikube cluster. Before running cluster tests the TEST_NAMESPACE
  namespace is removed, if it exists, from the minikube cluster. Resources are created as part of the cluster tests in the
  TEST_NAMESPACE namespace. This is done to minimize destructive impact of the cluster tests on an existing minikube
  cluster and vice versa.
*/
import { Application } from "spectron";
import * as utils from "../helpers/utils";
import { listHelmRepositories } from "../helpers/utils";
import { fail } from "assert";


jest.setTimeout(60000);

// FIXME (!): improve / simplify all css-selectors + use [data-test-id="some-id"] (already used in some tests below)
describe("Lens integration tests", () => {
  let app: Application;

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
      await app.electron.ipcRenderer.send("test-menu-item-click", "File", "Add Cluster");
      await app.client.waitUntilTextExists("h2", "Add Cluster");
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
