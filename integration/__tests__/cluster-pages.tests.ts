/*
  Cluster tests are run if there is a pre-existing minikube cluster. Before running cluster tests the TEST_NAMESPACE
  namespace is removed, if it exists, from the minikube cluster. Resources are created as part of the cluster tests in the
  TEST_NAMESPACE namespace. This is done to minimize destructive impact of the cluster tests on an existing minikube
  cluster and vice versa.
*/
import { Application } from "spectron";
import * as utils from "../helpers/utils";
import { addMinikubeCluster, minikubeReady, waitForMinikubeDashboard } from "../helpers/minikube";
import { exec } from "child_process";
import * as util from "util";

export const promiseExec = util.promisify(exec);

jest.setTimeout(60000);

// FIXME (!): improve / simplify all css-selectors + use [data-test-id="some-id"] (already used in some tests below)
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
      beforeAll(utils.wrapJestLifecycle(async () => {
        app = await utils.appStart();
      }));

      afterAll(utils.wrapJestLifecycle(async () => {
        if (app && app.isRunning()) {
          return utils.tearDown(app);
        }
      }));

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

    describe("cluster pages", () => {

      beforeAll(utils.wrapJestLifecycle(appStartAddCluster));

      afterAll(utils.wrapJestLifecycle(async () => {
        if (app && app.isRunning()) {
          return utils.tearDown(app);
        }
      }));

      const tests: {
        drawer?: string
        drawerId?: string
        pages: {
          name: string,
          href: string,
          expectedSelector: string,
          expectedText: string
        }[]
      }[] = [{
        drawer: "",
        drawerId: "",
        pages: [{
          name: "Cluster",
          href: "cluster",
          expectedSelector: "div.ClusterOverview div.label",
          expectedText: "Master"
        }]
      },
      {
        drawer: "",
        drawerId: "",
        pages: [{
          name: "Nodes",
          href: "nodes",
          expectedSelector: "h5.title",
          expectedText: "Nodes"
        }]
      },
      {
        drawer: "Workloads",
        drawerId: "workloads",
        pages: [{
          name: "Overview",
          href: "workloads",
          expectedSelector: "h5.box",
          expectedText: "Overview"
        },
        {
          name: "Pods",
          href: "pods",
          expectedSelector: "h5.title",
          expectedText: "Pods"
        },
        {
          name: "Deployments",
          href: "deployments",
          expectedSelector: "h5.title",
          expectedText: "Deployments"
        },
        {
          name: "DaemonSets",
          href: "daemonsets",
          expectedSelector: "h5.title",
          expectedText: "Daemon Sets"
        },
        {
          name: "StatefulSets",
          href: "statefulsets",
          expectedSelector: "h5.title",
          expectedText: "Stateful Sets"
        },
        {
          name: "ReplicaSets",
          href: "replicasets",
          expectedSelector: "h5.title",
          expectedText: "Replica Sets"
        },
        {
          name: "Jobs",
          href: "jobs",
          expectedSelector: "h5.title",
          expectedText: "Jobs"
        },
        {
          name: "CronJobs",
          href: "cronjobs",
          expectedSelector: "h5.title",
          expectedText: "Cron Jobs"
        }]
      },
      {
        drawer: "Configuration",
        drawerId: "config",
        pages: [{
          name: "ConfigMaps",
          href: "configmaps",
          expectedSelector: "h5.title",
          expectedText: "Config Maps"
        },
        {
          name: "Secrets",
          href: "secrets",
          expectedSelector: "h5.title",
          expectedText: "Secrets"
        },
        {
          name: "Resource Quotas",
          href: "resourcequotas",
          expectedSelector: "h5.title",
          expectedText: "Resource Quotas"
        },
        {
          name: "Limit Ranges",
          href: "limitranges",
          expectedSelector: "h5.title",
          expectedText: "Limit Ranges"
        },
        {
          name: "HPA",
          href: "hpa",
          expectedSelector: "h5.title",
          expectedText: "Horizontal Pod Autoscalers"
        },
        {
          name: "Pod Disruption Budgets",
          href: "poddisruptionbudgets",
          expectedSelector: "h5.title",
          expectedText: "Pod Disruption Budgets"
        }]
      },
      {
        drawer: "Network",
        drawerId: "networks",
        pages: [{
          name: "Services",
          href: "services",
          expectedSelector: "h5.title",
          expectedText: "Services"
        },
        {
          name: "Endpoints",
          href: "endpoints",
          expectedSelector: "h5.title",
          expectedText: "Endpoints"
        },
        {
          name: "Ingresses",
          href: "ingresses",
          expectedSelector: "h5.title",
          expectedText: "Ingresses"
        },
        {
          name: "Network Policies",
          href: "network-policies",
          expectedSelector: "h5.title",
          expectedText: "Network Policies"
        }]
      },
      {
        drawer: "Storage",
        drawerId: "storage",
        pages: [{
          name: "Persistent Volume Claims",
          href: "persistent-volume-claims",
          expectedSelector: "h5.title",
          expectedText: "Persistent Volume Claims"
        },
        {
          name: "Persistent Volumes",
          href: "persistent-volumes",
          expectedSelector: "h5.title",
          expectedText: "Persistent Volumes"
        },
        {
          name: "Storage Classes",
          href: "storage-classes",
          expectedSelector: "h5.title",
          expectedText: "Storage Classes"
        }]
      },
      {
        drawer: "",
        drawerId: "",
        pages: [{
          name: "Namespaces",
          href: "namespaces",
          expectedSelector: "h5.title",
          expectedText: "Namespaces"
        }]
      },
      {
        drawer: "",
        drawerId: "",
        pages: [{
          name: "Events",
          href: "events",
          expectedSelector: "h5.title",
          expectedText: "Events"
        }]
      },
      {
        drawer: "Apps",
        drawerId: "apps",
        pages: [{
          name: "Charts",
          href: "apps/charts",
          expectedSelector: "div.HelmCharts input",
          expectedText: ""
        },
        {
          name: "Releases",
          href: "apps/releases",
          expectedSelector: "h5.title",
          expectedText: "Releases"
        }]
      },
      {
        drawer: "Access Control",
        drawerId: "users",
        pages: [{
          name: "Service Accounts",
          href: "service-accounts",
          expectedSelector: "h5.title",
          expectedText: "Service Accounts"
        },
        {
          name: "Role Bindings",
          href: "role-bindings",
          expectedSelector: "h5.title",
          expectedText: "Role Bindings"
        },
        {
          name: "Roles",
          href: "roles",
          expectedSelector: "h5.title",
          expectedText: "Roles"
        },
        {
          name: "Pod Security Policies",
          href: "pod-security-policies",
          expectedSelector: "h5.title",
          expectedText: "Pod Security Policies"
        }]
      },
      {
        drawer: "Custom Resources",
        drawerId: "custom-resources",
        pages: [{
          name: "Definitions",
          href: "crd/definitions",
          expectedSelector: "h5.title",
          expectedText: "Custom Resources"
        }]
      }];

      tests.forEach(({ drawer = "", drawerId = "", pages }) => {
        if (drawer !== "") {
          it(`shows ${drawer} drawer`, async () => {
            expect(clusterAdded).toBe(true);
            await app.client.click(`.sidebar-nav [data-test-id="${drawerId}"] span.link-text`);
            await app.client.waitUntilTextExists(`a[href^="/${pages[0].href}"]`, pages[0].name);
          });
        }
        pages.forEach(({ name, href, expectedSelector, expectedText }) => {
          it(`shows ${drawer}->${name} page`, async () => {
            expect(clusterAdded).toBe(true);
            await app.client.click(`a[href^="/${href}"]`);
            await app.client.waitUntilTextExists(expectedSelector, expectedText);
          });
        });

        if (drawer !== "") {
          // hide the drawer
          it(`hides ${drawer} drawer`, async () => {
            expect(clusterAdded).toBe(true);
            await app.client.click(`.sidebar-nav [data-test-id="${drawerId}"] span.link-text`);
            await expect(app.client.waitUntilTextExists(`a[href^="/${pages[0].href}"]`, pages[0].name, 100)).rejects.toThrow();
          });
        }
      });
    });

    describe("viewing pod logs", () => {
      beforeEach(utils.wrapJestLifecycle(appStartAddCluster));

      afterEach(utils.wrapJestLifecycle(async () => {
        if (app?.isRunning()) {
          return utils.tearDown(app);
        }
      }));

      it(`shows a logs for a pod`, async () => {
        expect(clusterAdded).toBe(true);
        // Go to Pods page
        await app.client.click(".sidebar-nav [data-test-id='workloads'] span.link-text");
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
      beforeEach(utils.wrapJestLifecycle(appStartAddCluster));

      afterEach(utils.wrapJestLifecycle(async () => {
        if (app?.isRunning()) {
          return utils.tearDown(app);
        }
      }));

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
        await app.client.click(".sidebar-nav [data-test-id='workloads'] span.link-text");
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
