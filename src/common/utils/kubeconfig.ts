import { app, remote } from "electron"
import  { ensureDirSync, writeFileSync } from "fs-extra"
import * as path from "path"

// todo: move to main/kubeconfig-manager.ts (?)

// Writes kubeconfigs to "embedded" store, i.e. .../Lens/kubeconfigs/
export function writeEmbeddedKubeConfig(clusterId: string, kubeConfig: string): string {
  // This can be called from main & renderer
  const userData = (app || remote.app).getPath("userData");
  const kubeConfigBase = path.join(userData, "kubeconfigs")
  ensureDirSync(kubeConfigBase)

  const kubeConfigFile = path.join(kubeConfigBase, clusterId)
  writeFileSync(kubeConfigFile, kubeConfig)

  return kubeConfigFile
}
