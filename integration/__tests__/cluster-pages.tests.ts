/*
  Cluster tests are run if there is a pre-existing minikube cluster. Before running cluster tests the TEST_NAMESPACE
  namespace is removed, if it exists, from the minikube cluster. Resources are created as part of the cluster tests in the
  TEST_NAMESPACE namespace. This is done to minimize destructive impact of the cluster tests on an existing minikube
  cluster and vice versa.
*/
import { addClusterAndOpen, describeIf, getMainMenuSelectors, minikubeReady, setupAppLifecycle } from "../helpers";

jest.setTimeout(5000);

type SidebarItem = {
  testId: string;
  expectedSelector?: string;
  expectedText?: string;
  subMenu?: {
    href: string;
    expectedSelector: string;
    expectedText: string;
  }[];
};

describe("Lens cluster pages", () => {
  const TEST_NAMESPACE = "cluster-pages-int-tests";
  const ready = minikubeReady(TEST_NAMESPACE);

  describeIf(ready)("cluster pages", () => {
    const runtime = setupAppLifecycle();

    beforeAll(async () => {
      await addClusterAndOpen(runtime.app);
    });

    const items: SidebarItem[] = [
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

    items.forEach(({ testId, expectedSelector, expectedText, subMenu }) => {
      const { sidebarItemRoot, expandIcon, pageLink } = getMainMenuSelectors(testId);

      if (subMenu) {
        it(`expands submenu for pages in "${testId}"`, async () => {
          await runtime.app.client.click(expandIcon);
          await runtime.app.client.waitForExist(pageLink(subMenu[0].href));
        });
        subMenu.forEach(({ href, expectedText, expectedSelector }) => {
          it(`opens page "${expectedText.toLowerCase() || href}"`, async () => {
            await runtime.app.client.click(pageLink(href));
            await runtime.app.client.waitUntilTextExists(expectedSelector, expectedText);
          });
        });
      } else {
        it(`opens page "${testId}"`, async () => {
          await runtime.app.client.click(sidebarItemRoot);
          await runtime.app.client.waitUntilTextExists(expectedSelector, expectedText);
        });
      }
    });
  });

});
