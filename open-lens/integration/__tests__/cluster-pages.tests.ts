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
import { describeIf } from "@k8slens/test-utils";

const TEST_NAMESPACE = "integration-tests";

describeIf(minikubeReady(TEST_NAMESPACE))("Minikube based tests", () => {
  let window: Page;
  let cleanup: undefined | (() => Promise<void>);
  let frame: Frame;

  beforeEach(async () => {
    ({ window, cleanup } = await utils.start());
    await utils.clickWelcomeButton(window);

    frame = await utils.launchMinikubeClusterFromCatalog(window);
  }, 10 * 60 * 1000);

  afterEach(async () => {
    await cleanup?.();
  }, 10 * 60 * 1000);

  it("shows cluster context menu in sidebar", async () => {
    await frame.click(`[data-testid="sidebar-cluster-dropdown"]`);
    await frame.waitForSelector(`.Menu >> text="Add to Hotbar"`);
    await frame.waitForSelector(`.Menu >> text="Settings"`);
    await frame.waitForSelector(`.Menu >> text="Disconnect"`);
    await frame.waitForSelector(`.Menu >> text="Remove"`);
  });

  // FIXME: failed locally since metrics might already exist, cc @aleksfront
  it.skip("opens cluster settings by clicking link in no-metrics area", async () => {
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
    "should show the default namespaces",
    async () => {
      await navigateToNamespaces(frame);
      await frame.waitForSelector("div.TableCell >> text='default'");
      await frame.waitForSelector("div.TableCell >> text='kube-system'");
    },
    10 * 60 * 1000,
  );

  it(
    `should create the ${TEST_NAMESPACE} and a pod in the namespace and then remove that pod via the context menu`,
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
      await monacoEditor.type(`name: ${testPodName}`, { delay: 10 });
      await monacoEditor.press("Enter", { delay: 10 });
      await monacoEditor.type(`namespace: ${TEST_NAMESPACE}`, { delay: 10 });
      await monacoEditor.press("Enter", { delay: 10 });
      await monacoEditor.press("Backspace", { delay: 10 });
      await monacoEditor.type("spec:", { delay: 10 });
      await monacoEditor.press("Enter", { delay: 10 });
      await monacoEditor.type("containers:", { delay: 10 });
      await monacoEditor.press("Enter", { delay: 10 });
      await monacoEditor.type(`- name: ${testPodName}`, { delay: 10 });
      await monacoEditor.press("Enter", { delay: 10 });
      await monacoEditor.type("  image: nginx:alpine", { delay: 10 });
      await monacoEditor.press("Enter", { delay: 10 });

      await frame.click(".Dock .Button >> text='Create'");
      await frame.waitForSelector(`.TableCell >> text=${testPodName}`);
      await frame.click(".TableRow .TableCell.menu");
      await frame.click(".MenuItem >> text=Delete");
      await frame.click("button >> text=Remove");
      await frame.waitForSelector(`.TableCell >> text=${testPodName}`, { state: "detached" });
    },
    10 * 60 * 1000,
  );
});

const selectorTimeout = { timeout: 30000 };

const scenarios = [
  {
    expectedSelector: "div[data-testid='cluster-overview-page'] div.label",
    parentSidebarItemTestId: null,
    sidebarItemTestId: "link-for-sidebar-item-cluster-overview",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: null,
    sidebarItemTestId: "link-for-sidebar-item-nodes",
  },

  {
    expectedSelector: 'h5 >> text="Overview"',
    parentSidebarItemTestId: "link-for-sidebar-item-workloads",
    sidebarItemTestId: "link-for-sidebar-item-workloads-overview",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-workloads",
    sidebarItemTestId: "link-for-sidebar-item-pods",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-workloads",
    sidebarItemTestId: "link-for-sidebar-item-deployments",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-workloads",
    sidebarItemTestId: "link-for-sidebar-item-daemon-sets",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-workloads",
    sidebarItemTestId: "link-for-sidebar-item-stateful-sets",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-workloads",
    sidebarItemTestId: "link-for-sidebar-item-replica-sets",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-workloads",
    sidebarItemTestId: "link-for-sidebar-item-jobs",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-workloads",
    sidebarItemTestId: "link-for-sidebar-item-cron-jobs",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-config",
    sidebarItemTestId: "link-for-sidebar-item-config-maps",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-config",
    sidebarItemTestId: "link-for-sidebar-item-secrets",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-config",
    sidebarItemTestId: "link-for-sidebar-item-resource-quotas",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-config",
    sidebarItemTestId: "link-for-sidebar-item-limit-ranges",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-config",
    sidebarItemTestId: "link-for-sidebar-item-horizontal-pod-autoscalers",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-config",
    sidebarItemTestId: "link-for-sidebar-item-pod-disruption-budgets",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-network",
    sidebarItemTestId: "link-for-sidebar-item-services",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-network",
    sidebarItemTestId: "link-for-sidebar-item-endpoints",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-network",
    sidebarItemTestId: "link-for-sidebar-item-ingresses",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-network",
    sidebarItemTestId: "link-for-sidebar-item-network-policies",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-storage",
    sidebarItemTestId: "link-for-sidebar-item-persistent-volume-claims",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-storage",
    sidebarItemTestId: "link-for-sidebar-item-persistent-volumes",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-storage",
    sidebarItemTestId: "link-for-sidebar-item-storage-classes",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: null,
    sidebarItemTestId: "link-for-sidebar-item-namespaces",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: null,
    sidebarItemTestId: "link-for-sidebar-item-events",
  },

  {
    expectedSelector: "div.HelmCharts input",
    parentSidebarItemTestId: "link-for-sidebar-item-helm",
    sidebarItemTestId: "link-for-sidebar-item-helm-charts",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-helm",
    sidebarItemTestId: "link-for-sidebar-item-helm-releases",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-user-management",
    sidebarItemTestId: "link-for-sidebar-item-service-accounts",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-user-management",
    sidebarItemTestId: "link-for-sidebar-item-cluster-roles",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-user-management",
    sidebarItemTestId: "link-for-sidebar-item-roles",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-user-management",
    sidebarItemTestId: "link-for-sidebar-item-cluster-role-bindings",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-user-management",
    sidebarItemTestId: "link-for-sidebar-item-role-bindings",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: null,
    sidebarItemTestId: "link-for-sidebar-item-custom-resources",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-config",
    sidebarItemTestId: "link-for-sidebar-item-validating-webhook-configurations",
  },

  {
    expectedSelector: "h5.title",
    parentSidebarItemTestId: "link-for-sidebar-item-config",
    sidebarItemTestId: "link-for-sidebar-item-mutating-webhook-configurations",
  },
];

const navigateToPods = async (frame: Frame) => {
  await frame.click(`[data-testid="link-for-sidebar-item-workloads"]`);
  await frame.click(`[data-testid="link-for-sidebar-item-pods"]`);
};

const navigateToNamespaces = async (frame: Frame) => {
  await frame.click(`[data-testid="link-for-sidebar-item-namespaces"]`);
};
