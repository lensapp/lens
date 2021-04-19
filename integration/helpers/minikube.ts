import { spawnSync } from "child_process";
import { Application } from "spectron";

export function minikubeReady(testNamespace: string): boolean {
  // determine if minikube is running
  {
    const { status } = spawnSync("minikube status", { shell: true });

    if (status !== 0) {
      console.warn("minikube not running");

      return false;
    }
  }

  // Remove TEST_NAMESPACE if it already exists
  {
    const { status } = spawnSync(`minikube kubectl -- get namespace ${testNamespace}`, { shell: true });

    if (status === 0) {
      console.warn(`Removing existing ${testNamespace} namespace`);

      const { status, stdout, stderr } = spawnSync(
        `minikube kubectl -- delete namespace ${testNamespace}`,
        { shell: true },
      );

      if (status !== 0) {
        console.warn(`Error removing ${testNamespace} namespace: ${stderr.toString()}`);

        return false;
      }

      console.log(stdout.toString());
    }
  }

  return true;
}

export async function addMinikubeCluster(app: Application) {
  await (await app.client.$("button.MuiSpeedDial-fab")).waitForDisplayed();
  await app.client.elementClick("button.MuiSpeedDial-fab");
  await (await app.client.$(`button[title="Add from kubeconfig"]`)).waitForDisplayed();
  await app.client.elementClick(`button[title="Add from kubeconfig"]`);
  await app.client.waitUntilTextExists("div", "Select kubeconfig file");
  await app.client.elementClick("div.Select__control"); // show the context drop-down list
  await app.client.waitUntilTextExists("div", "minikube");

  if (!await app.client.isElementEnabled("button.primary")) {
    await app.client.elementClick("div.minikube"); // select minikube context
  } // else the only context, which must be 'minikube', is automatically selected
  await app.client.elementClick("div.Select__control"); // hide the context drop-down list (it might be obscuring the Add cluster(s) button)
  await app.client.elementClick("button.primary"); // add minikube cluster
  await app.client.waitUntilTextExists("div.TableCell", "minikube");
  await app.client.elementClick("div.TableRow");
}

export async function waitForMinikubeDashboard(app: Application) {
  await app.client.waitUntilTextExists("pre.kube-auth-out", "Authentication proxy started");
  await (await app.client.$(`iframe[name="minikube"]`)).waitForDisplayed();
  await (await app.client.$("iframe[name=minikube]")).waitForExist();
  await app.client.waitUntilTextExists("span.link-text", "Cluster");
}
