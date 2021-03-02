/*
  Cluster tests are run if there is a pre-existing minikube cluster. Before running cluster tests the TEST_NAMESPACE
  namespace is removed, if it exists, from the minikube cluster. Resources are created as part of the cluster tests in the
  TEST_NAMESPACE namespace. This is done to minimize destructive impact of the cluster tests on an existing minikube
  cluster and vice versa.
*/
import { Application } from "spectron";
import * as utils from "../helpers/utils";
import { addMinikubeCluster, minikubeReady, waitForMinikubeDashboard } from "../helpers/minikube";

jest.setTimeout(60000);

describe("Lens cluster pages", () => {
  const TEST_NAMESPACE = "integration-tests";
  const BACKSPACE = "\uE003";
  let app: Application;
  const ready = minikubeReady(TEST_NAMESPACE);

  utils.describeIf(ready)("test common pages", () => {
    let clusterAdded = false;
    const addCluster = async () => {
      await utils.clickWhatsNew(app);
      await addMinikubeCluster(app);
      await waitForMinikubeDashboard(app);
      await app.client.click('a[href="/nodes"]');
      await app.client.waitUntilTextExists("div.TableCell", "Ready");
    };

    describe("cluster add", () => {
      beforeAll(async () => app = await utils.appStart(), 20000);

      afterAll(async () => {
        if (app && app.isRunning()) {
          return utils.tearDown(app);
        }
      });

      it("allows to add a cluster", async () => {
        await addCluster();
        clusterAdded = true;
      });
    });

    const appStartAddCluster = async () => {
      if (clusterAdded) {
        app = await utils.appStart();
        await addCluster();
      }
    };

    function getSidebarSelectors(testId: string) {
      const baseSelector = `.Sidebar [data-test-id="${testId}"]`;

      return {
        sidebarItemRoot: baseSelector,
        expandIcon: `${baseSelector} .expand-icon`,
        pageLink(href: string){
          return `${baseSelector} a[href^="/${href}"]`;
        }
      };
    }

    describe("cluster pages", () => {

      beforeAll(appStartAddCluster, 40000);

      afterAll(async () => {
        if (app && app.isRunning()) {
          return utils.tearDown(app);
        }
      });

      type SidebarItem = {
        testId: string;
        expectedSelector?: string;
        expectedText?: string;
        subMenu?: Required<Omit<SidebarItem & { href: string }, "testId" | "subMenu">>[];
      };

      const sidebarMenu: SidebarItem[] = [
        {
          testId: "cluster",
          expectedSelector: "div.ClusterOverview div.label",
          expectedText: "Master",
        },
        {
          testId: "nodes",
          expectedSelector: "h5.title",
          expectedText: "Nodes"
        },
        {
          testId: "workloads",
          subMenu: [
            {
              href: "workloads",
              expectedSelector: "h5",
              expectedText: "Overview",
            },
            {
              href: "pods",
              expectedSelector: "h5.title",
              expectedText: "Pods"
            },
            {
              href: "deployments",
              expectedSelector: "h5.title",
              expectedText: "Deployments"
            },
            {
              href: "daemonsets",
              expectedSelector: "h5.title",
              expectedText: "Daemon Sets"
            },
            {
              href: "statefulsets",
              expectedSelector: "h5.title",
              expectedText: "Stateful Sets"
            },
            {
              href: "replicasets",
              expectedSelector: "h5.title",
              expectedText: "Replica Sets"
            },
            {
              href: "jobs",
              expectedSelector: "h5.title",
              expectedText: "Jobs"
            },
            {
              href: "cronjobs",
              expectedSelector: "h5.title",
              expectedText: "Cron Jobs"
            }]
        },
        {
          testId: "config",
          subMenu: [
            {
              href: "configmaps",
              expectedSelector: "h5.title",
              expectedText: "Config Maps"
            },
            {
              href: "secrets",
              expectedSelector: "h5.title",
              expectedText: "Secrets"
            },
            {
              href: "resourcequotas",
              expectedSelector: "h5.title",
              expectedText: "Resource Quotas"
            },
            {
              href: "limitranges",
              expectedSelector: "h5.title",
              expectedText: "Limit Ranges"
            },
            {
              href: "hpa",
              expectedSelector: "h5.title",
              expectedText: "Horizontal Pod Autoscalers"
            },
            {
              href: "poddisruptionbudgets",
              expectedSelector: "h5.title",
              expectedText: "Pod Disruption Budgets"
            }]
        },
        {
          testId: "networks",
          subMenu: [
            {
              href: "services",
              expectedSelector: "h5.title",
              expectedText: "Services"
            },
            {
              href: "endpoints",
              expectedSelector: "h5.title",
              expectedText: "Endpoints"
            },
            {
              href: "ingresses",
              expectedSelector: "h5.title",
              expectedText: "Ingresses"
            },
            {
              href: "network-policies",
              expectedSelector: "h5.title",
              expectedText: "Network Policies"
            }]
        },
        {
          testId: "storage",
          subMenu: [
            {
              href: "persistent-volume-claims",
              expectedSelector: "h5.title",
              expectedText: "Persistent Volume Claims"
            },
            {
              href: "persistent-volumes",
              expectedSelector: "h5.title",
              expectedText: "Persistent Volumes"
            },
            {
              href: "storage-classes",
              expectedSelector: "h5.title",
              expectedText: "Storage Classes"
            }]
        },
        {
          testId: "namespaces",
          expectedSelector: "h5.title",
          expectedText: "Namespaces",
        },
        {
          testId: "events",
          expectedSelector: "h5.title",
          expectedText: "Events",
        },
        {
          testId: "apps",
          subMenu: [
            {
              href: "apps/charts",
              expectedSelector: "div.HelmCharts input",
              expectedText: ""
            },
            {
              href: "apps/releases",
              expectedSelector: "h5.title",
              expectedText: "Releases"
            }]
        },
        {
          testId: "users",
          subMenu: [
            {
              href: "service-accounts",
              expectedSelector: "h5.title",
              expectedText: "Service Accounts"
            },
            {
              href: "role-bindings",
              expectedSelector: "h5.title",
              expectedText: "Role Bindings"
            },
            {
              href: "roles",
              expectedSelector: "h5.title",
              expectedText: "Roles"
            },
            {
              href: "pod-security-policies",
              expectedSelector: "h5.title",
              expectedText: "Pod Security Policies"
            }]
        },
        {
          testId: "custom-resources",
          subMenu: [{
            href: "crd/definitions",
            expectedSelector: "h5.title",
            expectedText: "Custom Resources"
          }]
        }];

      sidebarMenu.forEach(({ testId, expectedSelector, expectedText, subMenu }) => {
        const { sidebarItemRoot, expandIcon, pageLink } = getSidebarSelectors(testId);

        if (subMenu) {
          it(`expands submenu for pages in "${testId}"`, async () => {
            expect(clusterAdded).toBe(true);
            await app.client.click(expandIcon);
            await app.client.waitForExist(pageLink(subMenu[0].href));
          });
          subMenu.forEach(({ href, expectedText, expectedSelector }) => {
            it(`opens page "${expectedText.toLowerCase() || href}"`, async () => {
              expect(clusterAdded).toBe(true);
              await app.client.click(pageLink(href));
              await app.client.waitUntilTextExists(expectedSelector, expectedText);
            });
          });
        } else {
          it(`opens page "${testId}"`, async () => {
            expect(clusterAdded).toBe(true);
            await app.client.click(sidebarItemRoot);
            await app.client.waitUntilTextExists(expectedSelector, expectedText);
          });
        }
      });
    });

    describe("viewing pod logs", () => {
      beforeEach(appStartAddCluster, 40000);

      afterEach(async () => {
        if (app && app.isRunning()) {
          return utils.tearDown(app);
        }
      });

      it(`shows a logs for a pod`, async () => {
        expect(clusterAdded).toBe(true);
        // Go to Pods page
        await app.client.click(getSidebarSelectors("workloads").expandIcon);
        await app.client.waitUntilTextExists('a[href^="/pods"]', "Pods");
        await app.client.click('a[href^="/pods"]');
        await app.client.click(".NamespaceSelect");
        await app.client.keys("kube-system");
        await app.client.keys("Enter");// "\uE007"
        await app.client.waitUntilTextExists("div.TableCell", "kube-apiserver");
        let podMenuItemEnabled = false;

        // Wait until extensions are enabled on renderer
        while (!podMenuItemEnabled) {
          const logs = await app.client.getRenderProcessLogs();

          podMenuItemEnabled = !!logs.find(entry => entry.message.includes("[EXTENSION]: enabled lens-pod-menu@"));

          if (!podMenuItemEnabled) {
            await new Promise(r => setTimeout(r, 1000));
          }
        }
        await new Promise(r => setTimeout(r, 500)); // Give some extra time to prepare extensions
        // Open logs tab in dock
        await app.client.click(".list .TableRow:first-child");
        await app.client.waitForVisible(".Drawer");
        await app.client.click(".drawer-title .Menu li:nth-child(2)");
        // Check if controls are available
        await app.client.waitForVisible(".LogList .VirtualList");
        await app.client.waitForVisible(".LogResourceSelector");
        //await app.client.waitForVisible(".LogSearch .SearchInput");
        await app.client.waitForVisible(".LogSearch .SearchInput input");
        // Search for semicolon
        await app.client.keys(":");
        await app.client.waitForVisible(".LogList .list span.active");
        // Click through controls
        await app.client.click(".LogControls .show-timestamps");
        await app.client.click(".LogControls .show-previous");
      });
    });

    describe("cluster operations", () => {
      beforeEach(appStartAddCluster, 40000);

      afterEach(async () => {
        if (app && app.isRunning()) {
          return utils.tearDown(app);
        }
      });

      it("shows default namespace", async () => {
        expect(clusterAdded).toBe(true);
        await app.client.click('a[href="/namespaces"]');
        await app.client.waitUntilTextExists("div.TableCell", "default");
        await app.client.waitUntilTextExists("div.TableCell", "kube-system");
      });

      it(`creates ${TEST_NAMESPACE} namespace`, async () => {
        expect(clusterAdded).toBe(true);
        await app.client.click('a[href="/namespaces"]');
        await app.client.waitUntilTextExists("div.TableCell", "default");
        await app.client.waitUntilTextExists("div.TableCell", "kube-system");
        await app.client.click("button.add-button");
        await app.client.waitUntilTextExists("div.AddNamespaceDialog", "Create Namespace");
        await app.client.keys(`${TEST_NAMESPACE}\n`);
        await app.client.waitForExist(`.name=${TEST_NAMESPACE}`);
      });

      it(`creates a pod in ${TEST_NAMESPACE} namespace`, async () => {
        expect(clusterAdded).toBe(true);
        await app.client.click(getSidebarSelectors("workloads").expandIcon);
        await app.client.waitUntilTextExists('a[href^="/pods"]', "Pods");
        await app.client.click('a[href^="/pods"]');

        await app.client.click(".NamespaceSelect");
        await app.client.keys(TEST_NAMESPACE);
        await app.client.keys("Enter");// "\uE007"
        await app.client.click(".Icon.new-dock-tab");
        await app.client.waitUntilTextExists("li.MenuItem.create-resource-tab", "Create resource");
        await app.client.click("li.MenuItem.create-resource-tab");
        await app.client.waitForVisible(".CreateResource div.ace_content");
        // Write pod manifest to editor
        await app.client.keys("apiVersion: v1\n");
        await app.client.keys("kind: Pod\n");
        await app.client.keys("metadata:\n");
        await app.client.keys("  name: nginx-create-pod-test\n");
        await app.client.keys(`namespace: ${TEST_NAMESPACE}\n`);
        await app.client.keys(`${BACKSPACE}spec:\n`);
        await app.client.keys("  containers:\n");
        await app.client.keys("- name: nginx-create-pod-test\n");
        await app.client.keys("  image: nginx:alpine\n");
        // Create deployment
        await app.client.waitForEnabled("button.Button=Create & Close");
        await app.client.click("button.Button=Create & Close");
        // Wait until first bits of pod appears on dashboard
        await app.client.waitForExist(".name=nginx-create-pod-test");
        // Open pod details
        await app.client.click(".name=nginx-create-pod-test");
        await app.client.waitUntilTextExists("div.drawer-title-text", "Pod: nginx-create-pod-test");
      });
    });
  });
});
