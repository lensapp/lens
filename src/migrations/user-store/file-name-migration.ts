import fse from "fs-extra";
import { app, remote } from "electron";
import path from "path";

export async function fileNameMigration() {
  const userDataPath = (app || remote.app).getPath("userData");
  const configJsonPath = path.join(userDataPath, "config.json");
  const lensUserStoreJsonPath = path.join(userDataPath, "lens-user-store.json");
  const [configJsonExists, lensUserStoreJsonExists] = await Promise.all([
    fse.pathExists(configJsonPath),
    fse.pathExists(lensUserStoreJsonPath),
  ]);

  if (configJsonExists && !lensUserStoreJsonExists) {
    await fse.move(configJsonPath, lensUserStoreJsonPath);
  }
}