import { Application } from "spectron";
import * as utils from "../helpers/utils";
import { addMinikubeCluster, minikubeReady } from "../helpers/minikube";
import { exec } from "child_process";
import * as util from "util";
import { click, waitForExist, waitForVisible, waitUntilTextExists } from "../helpers/client";

export const promiseExec = util.promisify(exec);

jest.setTimeout(60000);

describe("Lens integration tests", () => {
  let app: Application;
  const ready = minikubeReady("workspace-int-tests");

  beforeEach(() => {
    console.debug(`startig: ${expect.getState().currentTestName}`);
  });

  utils.describeIf(ready)("workspaces", () => {
    beforeAll(async () => {
      app = await utils.appStart();
      await utils.clickWhatsNew(app);
    }, 20000);

    afterAll(async () => {
      if (app && app.isRunning()) {
        return utils.tearDown(app);
      }
    });

    const switchToWorkspace = async (name: string) => {
      await click(app.client, "[data-test-id=current-workspace]");
      await app.client.keys(name);
      await app.client.keys("Enter");
      await waitUntilTextExists(app.client, "[data-test-id=current-workspace-name]", name);
    };

    const createWorkspace = async (name: string) => {
      await click(app.client, "[data-test-id=current-workspace]");
      await app.client.keys("add workspace");
      await app.client.keys("Enter");
      await app.client.keys(name);
      await app.client.keys("Enter");
      await waitUntilTextExists(app.client, "[data-test-id=current-workspace-name]", name);
    };

    it("creates new workspace", async () => {
      const name = "test-workspace";

      await createWorkspace(name);
      await waitUntilTextExists(app.client, "[data-test-id=current-workspace-name]", name);
    });

    it("edits current workspaces", async () => {
      await createWorkspace("to-be-edited");
      await click(app.client, "[data-test-id=current-workspace]");
      await app.client.keys("edit current workspace");
      await app.client.keys("Enter");
      await app.client.keys("edited-workspace");
      await app.client.keys("Enter");
      await waitUntilTextExists(app.client, "[data-test-id=current-workspace-name]", "edited-workspace");
    });

    it("adds cluster in default workspace", async () => {
      await switchToWorkspace("default");
      await addMinikubeCluster(app);
      await waitUntilTextExists(app.client, "pre.kube-auth-out", "Authentication proxy started");
      await waitForExist(app.client, `iframe[name="minikube"]`);
      await waitForVisible(app.client, ".ClustersMenu .ClusterIcon.active");
    });

    it("adds cluster in test-workspace", async () => {
      await switchToWorkspace("test-workspace");
      await addMinikubeCluster(app);
      await waitUntilTextExists(app.client, "pre.kube-auth-out", "Authentication proxy started");
      await waitForExist(app.client, `iframe[name="minikube"]`);
    });
  });
});
