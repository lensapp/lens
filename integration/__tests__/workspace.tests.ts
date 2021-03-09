import { addMinikubeCluster, clickWhatsNew, describeIf, minikubeReady, setupAppLifecycle } from "../helpers";

jest.setTimeout(60000);

describe("Lens workspace tests", () => {
  const ready = minikubeReady("workspaces-int-tests");

  describeIf(ready)("workspaces", () => {
    const runtime = setupAppLifecycle(clickWhatsNew);

    const switchToWorkspace = async (name: string) => {
      await runtime.app.client.click("[data-test-id=current-workspace]");
      await runtime.app.client.keys(name);
      await runtime.app.client.keys("Enter");
      await runtime.app.client.waitUntilTextExists("[data-test-id=current-workspace-name]", name);
    };

    const createWorkspace = async (name: string) => {
      await runtime.app.client.click("[data-test-id=current-workspace]");
      await runtime.app.client.keys("add workspace");
      await runtime.app.client.keys("Enter");
      await runtime.app.client.keys(name);
      await runtime.app.client.keys("Enter");
      await runtime.app.client.waitUntilTextExists("[data-test-id=current-workspace-name]", name);
    };

    it("creates new workspace", async () => {
      const name = "test-workspace";

      await createWorkspace(name);
      await runtime.app.client.waitUntilTextExists("[data-test-id=current-workspace-name]", name);
    });

    it("edits current workspaces", async () => {
      await createWorkspace("to-be-edited");
      await runtime.app.client.click("[data-test-id=current-workspace]");
      await runtime.app.client.keys("edit current workspace");
      await runtime.app.client.keys("Enter");
      await runtime.app.client.keys("edited-workspace");
      await runtime.app.client.keys("Enter");
      await runtime.app.client.waitUntilTextExists("[data-test-id=current-workspace-name]", "edited-workspace");
    });

    it("adds cluster in default workspace", async () => {
      await switchToWorkspace("default");
      await addMinikubeCluster(runtime.app);
      await runtime.app.client.waitUntilTextExists("pre.kube-auth-out", "Authentication proxy started");
      await runtime.app.client.waitForExist(`iframe[name="minikube"]`);
      await runtime.app.client.waitForVisible(".ClustersMenu .ClusterIcon.active");
    });

    it("adds cluster in test-workspace", async () => {
      await switchToWorkspace("test-workspace");
      await addMinikubeCluster(runtime.app);
      await runtime.app.client.waitUntilTextExists("pre.kube-auth-out", "Authentication proxy started");
      await runtime.app.client.waitForExist(`iframe[name="minikube"]`);
    });
  });
});
