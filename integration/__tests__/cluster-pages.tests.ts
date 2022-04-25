/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/*
  Cluster tests are run if there is a pre-existing minikube cluster. Before running cluster tests the TEST_NAMESPACE
  namespace is removed, if it exists, from the minikube cluster. Resources are created as part of the cluster tests in the
  TEST_NAMESPACE namespace. This is done to minimize destructive impact of the cluster tests on an existing minikube
  cluster and vice versa.
*/
import * as utils from "../helpers/utils";
import { minikubeReady } from "../helpers/minikube";
import type { Frame, Page } from "playwright";
import { groupBy, toPairs } from "lodash/fp";
import { pipeline } from "@ogre-tools/fp";

const TEST_NAMESPACE = "integration-tests";

utils.describeIf(minikubeReady(TEST_NAMESPACE))("Minikube based tests", () => {
  let window: Page, cleanup: () => Promise<void>, frame: Frame;

  beforeEach(async () => {
    ({ window, cleanup } = await utils.start());
    await utils.clickWelcomeButton(window);

    frame = await utils.lauchMinikubeClusterFromCatalog(window);
  }, 10 * 60 * 1000);

  afterEach(async () => {
    await cleanup();
  }, 10 * 60 * 1000);

  it("shows cluster context menu in sidebar", async () => {
    await frame.click(`[data-testid="sidebar-cluster-dropdown"]`);
    await frame.waitForSelector(`.Menu >> text="Add to Hotbar"`);
    await frame.waitForSelector(`.Menu >> text="Settings"`);
    await frame.waitForSelector(`.Menu >> text="Disconnect"`);
    await frame.waitForSelector(`.Menu >> text="Remove"`);
  });

  it("opens cluster settings by clicking link in no-metrics area", async () => {
    await frame.locator("text=Open cluster settings >> nth=0").click();
    await window.waitForSelector(`[data-testid="metrics-header"]`);
  });

  it(
    "should navigate around common cluster pages",
    async () => {
      const scenariosByParent = pipeline(
        scenarios,
        groupBy("parentSidebarItemTestId"),
        toPairs,
      );

      for (const [parentSidebarItemTestId, scenarios] of scenariosByParent) {
        if (parentSidebarItemTestId !== "null") {
          await frame.click(`[data-testid="${parentSidebarItemTestId}"]`);
        }

        for (const scenario of scenarios) {
          await frame.click(`[data-testid="${scenario.sidebarItemTestId}"]`);

          await frame.waitForSelector(
            scenario.expectedSelector,
            selectorTimeout,
          );
        }
      }
    },

    10 * 60 * 1000,
  );

  it(
    "show logs and highlight the log search entries",
    async () => {
      await navigateToPods(frame);

      const namespacesSelector = await frame.waitForSelector(
        ".NamespaceSelect",
      );

      await namespacesSelector.click();
      await namespacesSelector.type("kube-system");
      await namespacesSelector.press("Enter");
      await namespacesSelector.click();

      const kubeApiServerRow = await frame.waitForSelector(
        "div.TableCell >> text=kube-apiserver",
      );

      await kubeApiServerRow.click();
      await frame.waitForSelector(".Drawer", { state: "visible" });

      const showPodLogsIcon = await frame.waitForSelector(
        ".Drawer .drawer-title .Icon >> text=subject",
      );

      showPodLogsIcon.click();

      // Check if controls are available
      await frame.waitForSelector(".Dock.isOpen");
      await frame.waitForSelector(".LogList .VirtualList");
      await frame.waitForSelector(".LogResourceSelector");

      const logSearchInput = await frame.waitForSelector(
        ".LogSearch .SearchInput input",
      );

      await logSearchInput.type(":");
      await frame.waitForSelector(".LogList .list span.active");

      const showTimestampsButton = await frame.waitForSelector(
        ".LogControls .show-timestamps",
      );

      await showTimestampsButton.click();

      const showPreviousButton = await frame.waitForSelector(
        ".LogControls .show-previous",
      );

      await showPreviousButton.click();
    },
    10 * 60 * 1000,
  );

  it(
    "should show the default namespaces",
    async () => {
      await navigateToNamespaces(frame);
      await frame.waitForSelector("div.TableCell >> text='default'");
      await frame.waitForSelector("div.TableCell >> text='kube-system'");
    },
    10 * 60 * 1000,
  );

  it(
    `should create the ${TEST_NAMESPACE} and a pod in the namespace`,
    async () => {
      await navigateToNamespaces(frame);
      await frame.click("button.add-button");
      await frame.waitForSelector(
        "div.AddNamespaceDialog >> text='Create Namespace'",
      );

      const namespaceNameInput = await frame.waitForSelector(
        ".AddNamespaceDialog input",
      );

      await namespaceNameInput.type(TEST_NAMESPACE);
      await namespaceNameInput.press("Enter");

      await frame.waitForSelector(`div.TableCell >> text=${TEST_NAMESPACE}`);

      await navigateToPods(frame);

      const namespacesSelector = await frame.waitForSelector(
        ".NamespaceSelect",
      );

      await namespacesSelector.click();
      await namespacesSelector.type(TEST_NAMESPACE);
      await namespacesSelector.press("Enter");
      await namespacesSelector.click();

      await frame.click(".Icon.new-dock-tab");

      try {
        await frame.click("li.MenuItem.create-resource-tab", {
          // NOTE: the following shouldn't be required, but is because without it a TypeError is thrown
          // see: https://github.com/microsoft/playwright/issues/8229
          position: {
            y: 0,
            x: 0,
          },
        });
      } catch (error) {
        console.log(error);
        await frame.waitForTimeout(100_000);
      }

      const testPodName = "nginx-create-pod-test";
      const monacoEditor = await frame.waitForSelector(`.Dock.isOpen [data-test-id="monaco-editor"]`);

      await monacoEditor.click();
      await monacoEditor.type("apiVersion: v1", { delay: 10 });
      await monacoEditor.press("Enter", { delay: 10 });
      await monacoEditor.type("kind: Pod", { delay: 10 });
      await monacoEditor.press("Enter", { delay: 10 });
      await monacoEditor.type("metadata:", { delay: 10 });
      await monacoEditor.press("Enter", { delay: 10 });
      await monacoEditor.type(`  name: ${testPodName}`, { delay: 10 });
      await monacoEditor.press("Enter", { delay: 10 });
      await monacoEditor.type(`namespace: ${TEST_NAMESPACE}`, { delay: 10 });
      await monacoEditor.press("Enter", { delay: 10 });
      await monacoEditor.press("Backspace", { delay: 10 });
      await monacoEditor.type("spec:", { delay: 10 });
      await monacoEditor.press("Enter", { delay: 10 });
      await monacoEditor.type("  containers:", { delay: 10 });
      await monacoEditor.press("Enter", { delay: 10 });
      await monacoEditor.type(`- name: ${testPodName}`, { delay: 10 });
      await monacoEditor.press("Enter", { delay: 10 });
      await monacoEditor.type("  image: nginx:alpine", { delay: 10 });
      await monacoEditor.press("Enter", { delay: 10 });

      await frame.click(".Dock .Button >> text='Create'");
      await frame.waitForSelector(`.TableCell >> text=${testPodName}`);
    },
    10 * 60 * 1000,
  );
});

const selectorTimeout = { timeout: 30000 };

const scenarios = [
  {
    expectedSelector: "div[data-testid='cluster-overview-page'] div.label",
    parentSidebarItemTestId: null,
    sidebarItemTestId: "sidebar-item-link-for-cluster-overview",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: null,
    sidebarItemTestId: "sidebar-item-link-for-nodes",
  },

  {
    expectedSelector: 'h5 >> text="Overview"',
    parentSidebarItemTestId: "sidebar-item-link-for-workloads",
    sidebarItemTestId: "sidebar-item-link-for-overview",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-workloads",
    sidebarItemTestId: "sidebar-item-link-for-pods",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-workloads",
    sidebarItemTestId: "sidebar-item-link-for-deployments",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-workloads",
    sidebarItemTestId: "sidebar-item-link-for-daemon-sets",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-workloads",
    sidebarItemTestId: "sidebar-item-link-for-stateful-sets",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-workloads",
    sidebarItemTestId: "sidebar-item-link-for-replica-sets",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-workloads",
    sidebarItemTestId: "sidebar-item-link-for-jobs",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-workloads",
    sidebarItemTestId: "sidebar-item-link-for-cron-jobs",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-config",
    sidebarItemTestId: "sidebar-item-link-for-config-maps",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-config",
    sidebarItemTestId: "sidebar-item-link-for-secrets",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-config",
    sidebarItemTestId: "sidebar-item-link-for-resource-quotas",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-config",
    sidebarItemTestId: "sidebar-item-link-for-limit-ranges",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-config",
    sidebarItemTestId: "sidebar-item-link-for-horizontal-pod-auto-scalers",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-config",
    sidebarItemTestId: "sidebar-item-link-for-pod-disruption-budgets",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-network",
    sidebarItemTestId: "sidebar-item-link-for-services",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-network",
    sidebarItemTestId: "sidebar-item-link-for-endpoints",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-network",
    sidebarItemTestId: "sidebar-item-link-for-ingresses",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-network",
    sidebarItemTestId: "sidebar-item-link-for-network-policies",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-storage",
    sidebarItemTestId: "sidebar-item-link-for-persistent-volume-claims",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-storage",
    sidebarItemTestId: "sidebar-item-link-for-persistent-volumes",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-storage",
    sidebarItemTestId: "sidebar-item-link-for-storage-classes",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: null,
    sidebarItemTestId: "sidebar-item-link-for-namespaces",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: null,
    sidebarItemTestId: "sidebar-item-link-for-events",
  },

  {
    expectedSelector: "div.HelmCharts input",
    parentSidebarItemTestId: "sidebar-item-link-for-helm",
    sidebarItemTestId: "sidebar-item-link-for-charts",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-helm",
    sidebarItemTestId: "sidebar-item-link-for-releases",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-user-management",
    sidebarItemTestId: "sidebar-item-link-for-service-accounts",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-user-management",
    sidebarItemTestId: "sidebar-item-link-for-roles",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-user-management",
    sidebarItemTestId: "sidebar-item-link-for-cluster-roles",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-user-management",
    sidebarItemTestId: "sidebar-item-link-for-role-bindings",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-user-management",
    sidebarItemTestId: "sidebar-item-link-for-cluster-role-bindings",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "sidebar-item-link-for-user-management",
    sidebarItemTestId: "sidebar-item-link-for-pod-security-policies",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: null,
    sidebarItemTestId: "sidebar-item-link-for-custom-resources",
  },
];

const navigateToPods = async (frame: Frame) => {
  await frame.click(`[data-testid="sidebar-item-link-for-workloads"]`);
  await frame.click(`[data-testid="sidebar-item-link-for-pods"]`);
};

const navigateToNamespaces = async (frame: Frame) => {
  await frame.click(`[data-testid="sidebar-item-link-for-namespaces"]`);
};
