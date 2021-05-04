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

export async function waitForMinikubeDashboard(app: Application) {
  await app.client.waitUntilTextExists("div.TableCell", "minikube");
  await app.client.waitForExist(".Input.SearchInput input");
  await app.client.setValue(".Input.SearchInput input", "minikube");
  await app.client.waitUntilTextExists("div.TableCell", "minikube");
  await app.client.click("div.TableRow");
  await app.client.waitUntilTextExists("pre.kube-auth-out", "Authentication proxy started");
  await app.client.waitForExist(`iframe[name="minikube"]`);
  await app.client.frame("minikube");
  await app.client.waitUntilTextExists("span.link-text", "Cluster");
}
