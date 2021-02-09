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
import { delay } from "../../src/common/utils";
import { AbortController } from "abort-controller";

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
      beforeAll(async () => app = await utils.appStart());

      afterAll(async () => {
        if (app?.isRunning()) {
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

    describe("cluster menu pages", () => {
      beforeAll(appStartAddCluster);

      afterAll(async () => {
        if (app?.isRunning()) {
          return utils.tearDown(app);
        }
      });

      type Page = [
        string, // name
        {
          href: string,
          expectedSelector: string,
          expectedText: string,
        }
      ];

      type PageTestCase = [
        string, // drawer
        {
          drawerId: string,
          pages: Page[],
        }
      ];

      const noSubMenuTests: Page[] = [
        [
          "Cluster",
          {
            href: "cluster",
            expectedSelector: "div.ClusterOverview div.label",
            expectedText: "Master",
          }
        ],
        [
          "Nodes",
          {
            href: "nodes",
            expectedSelector: "h5.title",
            expectedText: "Nodes"
          }
        ],
        [
          "Namespaces",
          {
            href: "namespaces",
            expectedSelector: "h5.title",
            expectedText: "Namespaces"
          }
        ],
        [
          "Events",
          {
            href: "events",
            expectedSelector: "h5.title",
            expectedText: "Events"
          }
        ],
      ];

      const subMenuTests: PageTestCase[] = [
        [
          "Workloads",
          {
            drawerId: "workloads",
            pages: [
              [
                "Overview",
                {
                  href: "workloads",
                  expectedSelector: "h5.box",
                  expectedText: "Overview"
                }
              ],
              [
                "Pods",
                {
                  href: "pods",
                  expectedSelector: "h5.title",
                  expectedText: "Pods"
                }
              ],
              [
                "Deployments",
                {
                  href: "deployments",
                  expectedSelector: "h5.title",
                  expectedText: "Deployments"
                }
              ],
              [
                "DaemonSets",
                {
                  href: "daemonsets",
                  expectedSelector: "h5.title",
                  expectedText: "Daemon Sets"
                }
              ],
              [
                "StatefulSets",
                {
                  href: "statefulsets",
                  expectedSelector: "h5.title",
                  expectedText: "Stateful Sets"
                }
              ],
              [
                "ReplicaSets",
                {
                  href: "replicasets",
                  expectedSelector: "h5.title",
                  expectedText: "Replica Sets"
                }
              ],
              [
                "Jobs",
                {
                  href: "jobs",
                  expectedSelector: "h5.title",
                  expectedText: "Jobs"
                }
              ],
              [
                "CronJobs",
                {
                  href: "cronjobs",
                  expectedSelector: "h5.title",
                  expectedText: "Cron Jobs"
                }
              ]
            ]
          }
        ],
        [
          "Configuration",
          {
            drawerId: "config",
            pages: [
              [
                "ConfigMaps",
                {
                  href: "configmaps",
                  expectedSelector: "h5.title",
                  expectedText: "Config Maps"
                }
              ],
              [
                "Secrets",
                {
                  href: "secrets",
                  expectedSelector: "h5.title",
                  expectedText: "Secrets"
                }
              ],
              [
                "Resource Quotas",
                {
                  href: "resourcequotas",
                  expectedSelector: "h5.title",
                  expectedText: "Resource Quotas"
                }
              ],
              [
                "Limit Ranges",
                {
                  href: "limitranges",
                  expectedSelector: "h5.title",
                  expectedText: "Limit Ranges"
                }
              ],
              [
                "HPA",
                {
                  href: "hpa",
                  expectedSelector: "h5.title",
                  expectedText: "Horizontal Pod Autoscalers"
                }
              ],
              [
                "Pod Disruption Budgets",
                {
                  href: "poddisruptionbudgets",
                  expectedSelector: "h5.title",
                  expectedText: "Pod Disruption Budgets"
                }
              ]
            ]
          }
        ],
        [
          "Network",
          {
            drawerId: "networks",
            pages: [
              [
                "Services",
                {
                  href: "services",
                  expectedSelector: "h5.title",
                  expectedText: "Services"
                }
              ],
              [
                "Endpoints",
                {
                  href: "endpoints",
                  expectedSelector: "h5.title",
                  expectedText: "Endpoints"
                }
              ],
              [
                "Ingresses",
                {
                  href: "ingresses",
                  expectedSelector: "h5.title",
                  expectedText: "Ingresses"
                }
              ],
              [
                "Network Policies",
                {
                  href: "network-policies",
                  expectedSelector: "h5.title",
                  expectedText: "Network Policies"
                }
              ]
            ]
          }
        ],
        [
          "Storage",
          {
            drawerId: "storage",
            pages: [
              [
                "Persistent Volume Claims",
                {
                  href: "persistent-volume-claims",
                  expectedSelector: "h5.title",
                  expectedText: "Persistent Volume Claims"
                }
              ],
              [
                "Persistent Volumes",
                {
                  href: "persistent-volumes",
                  expectedSelector: "h5.title",
                  expectedText: "Persistent Volumes"
                }
              ],
              [
                "Storage Classes",
                {
                  href: "storage-classes",
                  expectedSelector: "h5.title",
                  expectedText: "Storage Classes"
                }
              ]
            ]
          }
        ],
        [
          "Apps",
          {
            drawerId: "apps",
            pages: [
              [
                "Charts",
                {
                  href: "apps/charts",
                  expectedSelector: "div.HelmCharts input",
                  expectedText: ""
                }
              ],
              [
                "Releases",
                {
                  href: "apps/releases",
                  expectedSelector: "h5.title",
                  expectedText: "Releases"
                }
              ]
            ]
          }
        ],
        [
          "Access Control",
          {
            drawerId: "users",
            pages: [
              [
                "Service Accounts",
                {
                  href: "service-accounts",
                  expectedSelector: "h5.title",
                  expectedText: "Service Accounts"
                }
              ],
              [
                "Role Bindings",
                {
                  href: "role-bindings",
                  expectedSelector: "h5.title",
                  expectedText: "Role Bindings"
                }
              ],
              [
                "Roles",
                {
                  href: "roles",
                  expectedSelector: "h5.title",
                  expectedText: "Roles"
                }
              ],
              [
                "Pod Security Policies",
                {
                  href: "pod-security-policies",
                  expectedSelector: "h5.title",
                  expectedText: "Pod Security Policies"
                }
              ]
            ]
          }
        ],
        [
          "Custom Resources",
          {
            drawerId: "custom-resources",
            pages: [
              [
                "Definitions",
                {
                  href: "crd/definitions",
                  expectedSelector: "h5.title",
                  expectedText: "Custom Resources"
                }
              ]
            ]
          }
        ]
      ];

      describe.each(noSubMenuTests)("%s", (name, { href, expectedSelector, expectedText }) => {
        it("shows page", async () => {
          expect(clusterAdded).toBe(true);
          await app.client.click(`a[href^="/${href}"]`);
          await app.client.waitUntilTextExists(expectedSelector, expectedText);
        });
      });

      describe.each(subMenuTests)("%s Drawer", (drawer, { drawerId, pages }) => {
        it("does open", async () => {
          expect(clusterAdded).toBe(true);
          await app.client.click(`.sidebar-nav [data-test-id="${drawerId}"] span.link-text`);
          await app.client.waitUntilTextExists(`a[href^="/${pages[0][1].href}"]`, pages[0][0]);
        });

        it.each(pages)("shows %s page", async (name, { href, expectedSelector, expectedText }) => {
          expect(clusterAdded).toBe(true);
          await app.client.click(`a[href^="/${href}"]`);
          await app.client.waitUntilTextExists(expectedSelector, expectedText);
        });

        it("does close", async () => {
          expect(clusterAdded).toBe(true);
          await app.client.click(`.sidebar-nav [data-test-id="${drawerId}"] span.link-text`);

          try {
            expect(await app.client.waitUntilTextExists(`a[href^="/${pages[0][1].href}"]`, pages[0][0], 100)).toBeUndefined();
          } catch (error) {
            expect(error).not.toBeUndefined();
          }
        });
      });
    });

    describe("viewing pod logs", () => {
      let abortContoller: AbortController;

      beforeEach(async () => {
        abortContoller = new AbortController();
        await appStartAddCluster();
      });

      afterEach(async () => {
        abortContoller.abort();
        
        if (app?.isRunning()) {
          await utils.tearDown(app);
        }
      });

      it("shows a logs for a pod", async () => {
        expect(clusterAdded).toBe(true);
        // Go to Pods page
        await app.client.click(".sidebar-nav [data-test-id='workloads'] span.link-text");
        await app.client.waitUntilTextExists('a[href^="/pods"]', "Pods");
        await app.client.click('a[href^="/pods"]');
        await app.client.click(".NamespaceSelect");
        await app.client.keys("kube-system");
        await app.client.keys("Enter");// "\uE007"
        await app.client.waitUntilTextExists("div.TableCell", "kube-apiserver");

        await utils.waitForLogsToContain(app, abortContoller, {
          renderer: ["[EXTENSION]: enabled lens-pod-menu@"],
        });

        await delay(2000); // Give some extra time to prepare extensions

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
      beforeEach(appStartAddCluster);

      afterEach(async () => {
        if (app?.isRunning()) {
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
