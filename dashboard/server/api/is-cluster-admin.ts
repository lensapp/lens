// Check cluster-admin rights for auth-token
// CLI: kubectl auth can-i '*' '*' --all-namespaces

import { reviewResourceAccess } from "./review-resource-access";
import { IKubeRequestParams } from "./kube-request";

export async function isClusterAdmin(params: Partial<IKubeRequestParams>): Promise<boolean> {
  try {
    const accessCheck = await reviewResourceAccess(params, {
      resource: "*",
      namespace: "*",
      group: "*",
      verb: "*",
    });
    return accessCheck.allowed;
  } catch (err) {
    return false;
  }
}
