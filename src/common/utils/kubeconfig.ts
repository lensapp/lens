import { app, remote } from "electron"
import  { ensureDirSync, writeFileSync } from "fs-extra"
import * as path from "path"

// Write kubeconfigs to "embedded" store, i.e. "/Users/ixrock/Library/Application Support/Lens/kubeconfigs"
export function writeEmbeddedKubeConfig(clusterId: string, kubeConfig: string): string {
  const userData = (app || remote.app).getPath("userData");
  const kubeConfigBase = path.join(userData, "kubeconfigs")
  ensureDirSync(kubeConfigBase)

  const kubeConfigFile = path.join(kubeConfigBase, clusterId)
  writeFileSync(kubeConfigFile, kubeConfig)

  return kubeConfigFile
}
