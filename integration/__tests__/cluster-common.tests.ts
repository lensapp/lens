import { addClusterAndOpen, BACKSPACE, describeIf, getMainMenuSelectors, minikubeReady, setupAppLifecycle } from "../helpers";

jest.setTimeout(60000);

describe("Lens cluster common tests", () => {
  const TEST_NAMESPACE = "cluster-common-int-tests";
  const ready = minikubeReady(TEST_NAMESPACE);

  describeIf(ready)("cluster operations", () => {
    const runtime = setupAppLifecycle();

    beforeAll(async () => {
      await addClusterAndOpen(runtime.app);
    });

    it("shows default namespace", async () => {
      await runtime.app.client.click('a[href="/namespaces"]');
      await runtime.app.client.waitUntilTextExists("div.TableCell", "default");
      await runtime.app.client.waitUntilTextExists("div.TableCell", "kube-system");
    });

    it(`creates ${TEST_NAMESPACE} namespace`, async () => {
      await runtime.app.client.click('a[href="/namespaces"]');
      await runtime.app.client.waitUntilTextExists("div.TableCell", "default");
      await runtime.app.client.waitUntilTextExists("div.TableCell", "kube-system");
      await runtime.app.client.click("button.add-button");
      await runtime.app.client.waitUntilTextExists("div.AddNamespaceDialog", "Create Namespace");
      await runtime.app.client.keys(`${TEST_NAMESPACE}\n`);
      await runtime.app.client.waitForExist(`.name=${TEST_NAMESPACE}`);
    });

    it(`creates a pod in ${TEST_NAMESPACE} namespace`, async () => {
      await runtime.app.client.click(getMainMenuSelectors("workloads").expandIcon);
      await runtime.app.client.waitUntilTextExists('a[href^="/pods"]', "Pods");
      await runtime.app.client.click('a[href^="/pods"]');

      await runtime.app.client.click(".NamespaceSelect");
      await runtime.app.client.keys(TEST_NAMESPACE);
      await runtime.app.client.keys("Enter");// "\uE007"
      await runtime.app.client.click(".Icon.new-dock-tab");
      await runtime.app.client.waitUntilTextExists("li.MenuItem.create-resource-tab", "Create resource");
      await runtime.app.client.click("li.MenuItem.create-resource-tab");
      await runtime.app.client.waitForVisible(".CreateResource div.ace_content");
      // Write pod manifest to editor
      await runtime.app.client.keys("apiVersion: v1\n");
      await runtime.app.client.keys("kind: Pod\n");
      await runtime.app.client.keys("metadata:\n");
      await runtime.app.client.keys("  name: nginx-create-pod-test\n");
      await runtime.app.client.keys(`namespace: ${TEST_NAMESPACE}\n`);
      await runtime.app.client.keys(`${BACKSPACE}spec:\n`);
      await runtime.app.client.keys("  containers:\n");
      await runtime.app.client.keys("- name: nginx-create-pod-test\n");
      await runtime.app.client.keys("  image: nginx:alpine\n");
      // Create deployment
      await runtime.app.client.waitForEnabled("button.Button=Create & Close");
      await runtime.app.client.click("button.Button=Create & Close");
      // Wait until first bits of pod appears on dashboard
      await runtime.app.client.waitForExist(".name=nginx-create-pod-test");
      // Open pod details
      await runtime.app.client.click(".name=nginx-create-pod-test");
      await runtime.app.client.waitUntilTextExists("div.drawer-title-text", "Pod: nginx-create-pod-test");
    });
  });
});
