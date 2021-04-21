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
  await app.client.waitForVisible("button.MuiSpeedDial-fab");
  await app.client.moveToObject("button.MuiSpeedDial-fab");
  await app.client.waitForVisible(`button[title="Add from kubeconfig"]`);
  await app.client.click(`button[title="Add from kubeconfig"]`);
  await app.client.waitUntilTextExists("div", "Select kubeconfig file");
  await app.client.click("div.Select__control"); // show the context drop-down list
  await app.client.waitUntilTextExists("div", "minikube");

  if (!await app.client.$("button.primary").isEnabled()) {
    await app.client.click("div.minikube"); // select minikube context
  } // else the only context, which must be 'minikube', is automatically selected
  await app.client.click("div.Select__control"); // hide the context drop-down list (it might be obscuring the Add cluster(s) button)
  await app.client.click("button.primary"); // add minikube cluster
  await app.client.waitUntilTextExists("div.TableCell", "minikube");
  await app.client.waitForExist(".Input.SearchInput input");
  await app.client.setValue(".Input.SearchInput input", "minikube");
  await app.client.waitUntilTextExists("div.TableCell", "minikube");
  await app.client.click("div.TableRow");
}

export async function waitForMinikubeDashboard(app: Application) {
  await app.client.waitUntilTextExists("pre.kube-auth-out", "Authentication proxy started");
  await app.client.waitForExist(`iframe[name="minikube"]`);
  await app.client.frame("minikube");
  await app.client.waitUntilTextExists("span.link-text", "Cluster");
}
