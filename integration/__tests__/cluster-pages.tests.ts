/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/* eslint-disable no-console */

/*
  Cluster tests are run if there is a pre-existing minikube cluster. Before running cluster tests the TEST_NAMESPACE
  namespace is removed, if it exists, from the minikube cluster. Resources are created as part of the cluster tests in the
  TEST_NAMESPACE namespace. This is done to minimize destructive impact of the cluster tests on an existing minikube
  cluster and vice versa.
*/
import * as utils from "../helpers/utils";
import { minikubeReady } from "../helpers/minikube";
import type { Frame, Page } from "playwright";

const TEST_NAMESPACE = "integration-tests";

function getSidebarSelectors(itemId: string) {
  const root = `.SidebarItem[data-test-id="${itemId}"]`;

  return {
    expandSubMenu: `${root} .nav-item`,
    subMenuLink: (href: string) => `[data-testid=cluster-sidebar] .sub-menu a[href^="${href}"]`,
  };
}

function getLoadedSelector(page: CommonPage): string {
  if (page.expectedText) {
    return `${page.expectedSelector} >> text='${page.expectedText}'`;
  }

  return page.expectedSelector;
}

interface CommonPage {
  name: string;
  href: string;
  expectedSelector: string;
  expectedText?: string;
}

interface TopPageTest {
  page: CommonPage;
}

interface SubPageTest {
  drawerId: string;
  pages: CommonPage[];
}

type CommonPageTest = TopPageTest | SubPageTest;

function isTopPageTest(test: CommonPageTest): test is TopPageTest {
  return typeof (test as any).page === "object";
}

const commonPageTests: CommonPageTest[] = [{
  page: {
    name: "Cluster",
    href: "/overview",
    expectedSelector: "div[data-testid='cluster-overview-page'] div.label",
    expectedText: "CPU",
  },
},
{
  page: {
    name: "Nodes",
    href: "/nodes",
    expectedSelector: "h5.title",
    expectedText: "Nodes",
  },
},
{
  drawerId: "workloads",
  pages: [
    {
      name: "Overview",
      href: "/workloads",
      expectedSelector: "h5.box",
      expectedText: "Overview",
    },
    {
      name: "Pods",
      href: "/pods",
      expectedSelector: "h5.title",
      expectedText: "Pods",
    },
    {
      name: "Deployments",
      href: "/deployments",
      expectedSelector: "h5.title",
      expectedText: "Deployments",
    },
    {
      name: "DaemonSets",
      href: "/daemonsets",
      expectedSelector: "h5.title",
      expectedText: "Daemon Sets",
    },
    {
      name: "StatefulSets",
      href: "/statefulsets",
      expectedSelector: "h5.title",
      expectedText: "Stateful Sets",
    },
    {
      name: "ReplicaSets",
      href: "/replicasets",
      expectedSelector: "h5.title",
      expectedText: "Replica Sets",
    },
    {
      name: "Jobs",
      href: "/jobs",
      expectedSelector: "h5.title",
      expectedText: "Jobs",
    },
    {
      name: "CronJobs",
      href: "/cronjobs",
      expectedSelector: "h5.title",
      expectedText: "Cron Jobs",
    },
  ],
},
{
  drawerId: "config",
  pages: [
    {
      name: "ConfigMaps",
      href: "/configmaps",
      expectedSelector: "h5.title",
      expectedText: "Config Maps",
    },
    {
      name: "Secrets",
      href: "/secrets",
      expectedSelector: "h5.title",
      expectedText: "Secrets",
    },
    {
      name: "Resource Quotas",
      href: "/resourcequotas",
      expectedSelector: "h5.title",
      expectedText: "Resource Quotas",
    },
    {
      name: "Limit Ranges",
      href: "/limitranges",
      expectedSelector: "h5.title",
      expectedText: "Limit Ranges",
    },
    {
      name: "HPA",
      href: "/hpa",
      expectedSelector: "h5.title",
      expectedText: "Horizontal Pod Autoscalers",
    },
    {
      name: "Pod Disruption Budgets",
      href: "/poddisruptionbudgets",
      expectedSelector: "h5.title",
      expectedText: "Pod Disruption Budgets",
    },
  ],
},
{
  drawerId: "networks",
  pages: [
    {
      name: "Services",
      href: "/services",
      expectedSelector: "h5.title",
      expectedText: "Services",
    },
    {
      name: "Endpoints",
      href: "/endpoints",
      expectedSelector: "h5.title",
      expectedText: "Endpoints",
    },
    {
      name: "Ingresses",
      href: "/ingresses",
      expectedSelector: "h5.title",
      expectedText: "Ingresses",
    },
    {
      name: "Network Policies",
      href: "/network-policies",
      expectedSelector: "h5.title",
      expectedText: "Network Policies",
    },
  ],
},
{
  drawerId: "storage",
  pages: [
    {
      name: "Persistent Volume Claims",
      href: "/persistent-volume-claims",
      expectedSelector: "h5.title",
      expectedText: "Persistent Volume Claims",
    },
    {
      name: "Persistent Volumes",
      href: "/persistent-volumes",
      expectedSelector: "h5.title",
      expectedText: "Persistent Volumes",
    },
    {
      name: "Storage Classes",
      href: "/storage-classes",
      expectedSelector: "h5.title",
      expectedText: "Storage Classes",
    },
  ],
},
{
  page: {
    name: "Namespaces",
    href: "/namespaces",
    expectedSelector: "h5.title",
    expectedText: "Namespaces",
  },
},
{
  page: {
    name: "Events",
    href: "/events",
    expectedSelector: "h5.title",
    expectedText: "Events",
  },
},
{
  drawerId: "apps",
  pages: [
    {
      name: "Charts",
      href: "/apps/charts",
      expectedSelector: "div.HelmCharts input",
    },
    {
      name: "Releases",
      href: "/apps/releases",
      expectedSelector: "h5.title",
      expectedText: "Releases",
    },
  ],
},
{
  drawerId: "users",
  pages: [
    {
      name: "Service Accounts",
      href: "/service-accounts",
      expectedSelector: "h5.title",
      expectedText: "Service Accounts",
    },
    {
      name: "Roles",
      href: "/roles",
      expectedSelector: "h5.title",
      expectedText: "Roles",
    },
    {
      name: "Cluster Roles",
      href: "/cluster-roles",
      expectedSelector: "h5.title",
      expectedText: "Cluster Roles",
    },
    {
      name: "Role Bindings",
      href: "/role-bindings",
      expectedSelector: "h5.title",
      expectedText: "Role Bindings",
    },
    {
      name: "Cluster Role Bindings",
      href: "/cluster-role-bindings",
      expectedSelector: "h5.title",
      expectedText: "Cluster Role Bindings",
    },
    {
      name: "Pod Security Policies",
      href: "/pod-security-policies",
      expectedSelector: "h5.title",
      expectedText: "Pod Security Policies",
    },
  ],
},
{
  drawerId: "custom-resources",
  pages: [
    {
      name: "Definitions",
      href: "/crd/definitions",
      expectedSelector: "h5.title",
      expectedText: "Custom Resources",
    },
  ],
}];

utils.describeIf(minikubeReady(TEST_NAMESPACE))("Minikube based tests", () => {
  let window: Page, cleanup: () => Promise<void>, frame: Frame;

  beforeEach(async () => {
    ({ window, cleanup } = await utils.start());
    await utils.clickWelcomeButton(window);

    frame = await utils.lauchMinikubeClusterFromCatalog(window);
  }, 10*60*1000);

  afterEach(async () => {
    await cleanup();
  }, 10*60*1000);

  it("shows cluster context menu in sidebar", async () => {
    await frame.click(`[data-testid="sidebar-cluster-dropdown"]`);
    await frame.waitForSelector(`.Menu >> text="Add to Hotbar"`);
    await frame.waitForSelector(`.Menu >> text="Settings"`);
    await frame.waitForSelector(`.Menu >> text="Disconnect"`);
    await frame.waitForSelector(`.Menu >> text="Delete"`);
  });

  it("should navigate around common cluster pages", async () => {
    for (const test of commonPageTests) {
      if (isTopPageTest(test)) {
        const { href, expectedText, expectedSelector } = test.page;
        const menuButton = await frame.waitForSelector(`a[href^="${href}"]`);

        await menuButton.click();
        await frame.waitForSelector(`${expectedSelector} >> text='${expectedText}'`);

        continue;
      }

      const { drawerId, pages } = test;
      const selectors = getSidebarSelectors(drawerId);
      const mainPageSelector = `${selectors.subMenuLink(pages[0].href)} >> text='${pages[0].name}'`;

      await frame.click(selectors.expandSubMenu);
      await frame.waitForSelector(mainPageSelector);

      for (const page of pages) {
        const subPageButton = await frame.waitForSelector(selectors.subMenuLink(page.href));

        await subPageButton.click();
        await frame.waitForSelector(getLoadedSelector(page));
      }

      await frame.click(selectors.expandSubMenu);
      await frame.waitForSelector(mainPageSelector, { state: "hidden" });
    }
  }, 10*60*1000);

  

  it("show logs and highlight the log search entries", async () => {
    await frame.click(`a[href="/workloads"]`);
    await frame.click(`a[href="/pods"]`);

    const namespacesSelector = await frame.waitForSelector(".NamespaceSelect");

    await namespacesSelector.click();
    await namespacesSelector.type("kube-system");
    await namespacesSelector.press("Enter");
    await namespacesSelector.click();

    const kubeApiServerRow = await frame.waitForSelector("div.TableCell >> text=kube-apiserver");

    await kubeApiServerRow.click();
    await frame.waitForSelector(".Drawer", { state: "visible" });

    const showPodLogsIcon = await frame.waitForSelector(".Drawer .drawer-title .Icon >> text=subject");

    showPodLogsIcon.click();

    // Check if controls are available
    await frame.waitForSelector(".Dock.isOpen");
    await frame.waitForSelector(".LogList .VirtualList");
    await frame.waitForSelector(".LogResourceSelector");

    const logSearchInput = await frame.waitForSelector(".LogSearch .SearchInput input");

    await logSearchInput.type(":");
    await frame.waitForSelector(".LogList .list span.active");

    const showTimestampsButton = await frame.waitForSelector(".LogControls .show-timestamps");

    await showTimestampsButton.click();

    const showPreviousButton = await frame.waitForSelector(".LogControls .show-previous");

    await showPreviousButton.click();
  }, 10*60*1000);

  it("should show the default namespaces", async () => {
    await frame.click('a[href="/namespaces"]');
    await frame.waitForSelector("div.TableCell >> text='default'");
    await frame.waitForSelector("div.TableCell >> text='kube-system'");
  }, 10*60*1000);

  it(`should create the ${TEST_NAMESPACE} and a pod in the namespace`, async () => {
    await frame.click('a[href="/namespaces"]');
    await frame.click("button.add-button");
    await frame.waitForSelector("div.AddNamespaceDialog >> text='Create Namespace'");

    const namespaceNameInput = await frame.waitForSelector(".AddNamespaceDialog input");

    await namespaceNameInput.type(TEST_NAMESPACE);
    await namespaceNameInput.press("Enter");

    await frame.waitForSelector(`div.TableCell >> text=${TEST_NAMESPACE}`);

    if ((await frame.innerText(`a[href^="/workloads"] .expand-icon`)) === "keyboard_arrow_down") {
      await frame.click(`a[href^="/workloads"]`);
    }

    await frame.click(`a[href^="/pods"]`);

    const namespacesSelector = await frame.waitForSelector(".NamespaceSelect");

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
    const monacoEditor = await frame.waitForSelector(`.Dock.isOpen [data-test-component="monaco-editor"]`);

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
  }, 10*60*1000);
});
