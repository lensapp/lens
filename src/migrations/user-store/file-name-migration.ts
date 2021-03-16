import fse from "fs-extra";
import { app, remote } from "electron";
import path from "path";

export async function fileNameMigration() {
  const userDataPath = (app || remote.app).getPath("userData");
  const configJsonPath = path.join(userDataPath, "config.json");
  const lensUserStoreJsonPath = path.join(userDataPath, "lens-user-store.json");

  try {
    await fse.move(configJsonPath, lensUserStoreJsonPath);
  } catch (error) {
    if (error.code === "ENOENT" && error.path === configJsonPath) { // (No such file or directory)
      return; // file already moved
    } else if (error.message === "dest already exists.") {
      await fse.remove(configJsonPath);
    } else {
      // pass other errors along
      throw error;
    }
  }
}
