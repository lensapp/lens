import { Application } from "spectron";
import * as utils from "../helpers/utils";
import { addMinikubeCluster, minikubeReady } from "../helpers/minikube";
import { exec } from "child_process";
import * as util from "util";
import { delay } from "../../src/common/utils";

export const promiseExec = util.promisify(exec);

jest.setTimeout(60000);

describe("Lens integration tests", () => {
  let app: Application;
  const ready = minikubeReady("workspace-int-tests");

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
      await app.client.click("[data-test-id=current-workspace]");
      await app.client.keys(name);
      await app.client.keys("Enter");
      await app.client.waitUntilTextExists("[data-test-id=current-workspace-name]", name);
    };

    const createWorkspace = async (name: string) => {
      await app.client.click("[data-test-id=current-workspace]");
      await app.client.keys("add workspace");
      await app.client.keys("Enter");
      await app.client.keys(name);
      await app.client.keys("Enter");
      await app.client.waitUntilTextExists("[data-test-id=current-workspace-name]", name);
    };

    it("creates new workspace", async () => {
      const name = "test-workspace";

      await createWorkspace(name);
      await app.client.waitUntilTextExists("[data-test-id=current-workspace-name]", name);
    });

    it("edits current workspaces", async () => {
      await createWorkspace("to-be-edited");
      await app.client.click("[data-test-id=current-workspace]");
      await app.client.keys("edit current workspace");
      await app.client.keys("Enter");
      await app.client.keys("edited-workspace");
      await app.client.keys("Enter");
      await app.client.waitUntilTextExists("[data-test-id=current-workspace-name]", "edited-workspace");
    });

    it("adds cluster in default workspace", async () => {
      await switchToWorkspace("default");
      await addMinikubeCluster(app);
      await app.client.waitUntilTextExists("pre.kube-auth-out", "Authentication proxy started");
      await app.client.waitForExist(`iframe[name="minikube"]`);
      await app.client.waitForVisible(".ClustersMenu .ClusterIcon.active");
    });

    it("shows workspace clusters in workspace overview", async () => {
      await switchToWorkspace("default");
      await app.client.click("[data-test-id=workspace-menu]");
      await delay(500);
      await app.client.click("[data-test-id=workspace-overview-menu-item]");
      await app.client.waitUntilTextExists("h2", "default");
      await app.client.waitUntilTextExists(".WorkspaceOverview .Table .TableRow .name", "minikube");
      await switchToWorkspace("test-workspace");
      await app.client.waitUntilTextExists("h2", "test-workspace");
      await delay(2000);
      await app.client.waitUntilTextExists(".WorkspaceOverview .Table .NoItems", "Item list is empty");
    });

    it("adds cluster in test-workspace", async () => {
      await switchToWorkspace("test-workspace");
      await addMinikubeCluster(app);
      await app.client.waitUntilTextExists("pre.kube-auth-out", "Authentication proxy started");
      await app.client.waitForExist(`iframe[name="minikube"]`);
    });
  });
});
