import { addClusterAndOpen, describeIf, getMainMenuSelectors, minikubeReady, setupAppLifecycle } from "../helpers";
import { delay } from "../../src/common/utils";

jest.setTimeout(60000);

describe("Lens logs tests", () => {
  const ready = minikubeReady("logs-int-tests");

  describeIf(ready)("Pod logs", () => {
    const runtime = setupAppLifecycle();

    beforeAll(async () => {
      await addClusterAndOpen(runtime.app);
    });

    it(`shows a logs for a pod`, async () => {
      // Go to Pods page
      await runtime.app.client.click(getMainMenuSelectors("workloads").expandIcon);
      await runtime.app.client.waitUntilTextExists('a[href^="/pods"]', "Pods");
      await runtime.app.client.click('a[href^="/pods"]');
      await runtime.app.client.click(".NamespaceSelect");
      await runtime.app.client.keys("kube-system");
      await runtime.app.client.keys("Enter");// "\uE007"
      await runtime.app.client.waitUntilTextExists("div.TableCell", "kube-apiserver");
      let podMenuItemEnabled = false;

      // Wait until extensions are enabled on renderer
      while (!podMenuItemEnabled) {
        const logs = await runtime.app.client.getRenderProcessLogs();

        podMenuItemEnabled = !!logs.find(entry => entry.message.includes("[EXTENSION]: enabled lens-pod-menu@"));

        if (!podMenuItemEnabled) {
          await delay(1000);
        }
      }
      await delay(500); // Give some extra time to prepare extensions
      // Open logs tab in dock
      await runtime.app.client.click(".list .TableRow:first-child");
      await runtime.app.client.waitForVisible(".Drawer");
      await runtime.app.client.click(".drawer-title .Menu li:nth-child(2)");
      // Check if controls are available
      await runtime.app.client.waitForVisible(".LogList .VirtualList");
      await runtime.app.client.waitForVisible(".LogResourceSelector");
      //await runtime.app.client.waitForVisible(".LogSearch .SearchInput");
      await runtime.app.client.waitForVisible(".LogSearch .SearchInput input");
      // Search for semicolon
      await runtime.app.client.keys(":");
      await runtime.app.client.waitForVisible(".LogList .list span.active");
      // Click through controls
      await runtime.app.client.click(".LogControls .show-timestamps");
      await runtime.app.client.click(".LogControls .show-previous");
    });
  });

});
