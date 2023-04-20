import { awaitAll } from "./await-all";
import type { GetLensLinkDirectory } from "./get-lens-link-directory";
import type { EnsureDirectory } from "./lens-link";
import { pipeline } from "@ogre-tools/fp";
import { map } from "lodash/fp";
import type { PackageJsonAndPath } from "./package-json-and-path";

export type CreateLensLinkDirectories = (packageJsons: PackageJsonAndPath[]) => Promise<void>;

export const createLensLinkDirectoriesFor =
  (getLensLinkDirectory: GetLensLinkDirectory, ensureDirectory: EnsureDirectory) =>
  async (packageJsons: PackageJsonAndPath[]) => {
    await pipeline(
      packageJsons,
      map(({ content: { name } }) => getLensLinkDirectory(name)),
      map(ensureDirectory),
      awaitAll,
    );
  };
