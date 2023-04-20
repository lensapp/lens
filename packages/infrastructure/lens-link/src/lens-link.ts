import type { JsonValue } from "type-fest";
import fse from "fs-extra";
import { dirname, resolve as _resolvePath } from "path";
import { pipeline } from "@ogre-tools/fp";
import { flatMap, map } from "lodash/fp";
import { getLensLinkDirectoryFor } from "./get-lens-link-directory";
import { removeExistingLensLinkDirectoriesFor } from "./remove-existing-lens-link-directories-for";
import { createLensLinkDirectoriesFor } from "./create-lens-link-directories-for";
import { getMissingPackageJsonsFor } from "./get-missing-package-jsons-for";
import { getPackageJsonsFor } from "./get-package-jsons-for";
import { getPackageJsonPathsFor } from "./get-package-json-paths-for";

export type LensLink = () => Promise<void>;

export type CreateSymlink = (target: string, path: string, type: "dir" | "file") => Promise<void>;
export type EnsureDirectory = (path: string) => Promise<void>;
export type RemoveDirectory = (path: string) => Promise<void>;
export type WriteJsonFile = (path: string, value: JsonValue) => Promise<void>;
export type ReadJsonFile = (path: string) => Promise<JsonValue>;
export type Exists = (path: string) => Promise<boolean>;
export type ResolvePath = typeof _resolvePath;

interface Dependencies {
  workingDirectory: string;
  resolvePath: ResolvePath;
  exists: Exists;
  readJsonFile: ReadJsonFile;
  writeJsonFile: WriteJsonFile;
  createSymlink: CreateSymlink;
  ensureDirectory: EnsureDirectory;
  removeDirectory: RemoveDirectory;
}

const existsAsd = fse.pathExists;
const readJsonFileAsd = fse.readJson;
const writeJsonFileAsd = fse.writeJson;
const createSymlinkAsd = fse.symlink;
const ensureDirectoryAsd = fse.ensureDir;
const removeDirectoryAsd = fse.remove;

export const lensLinkFor =
  (
    {
      workingDirectory,
      resolvePath,
      exists,
      readJsonFile,
      writeJsonFile,
      createSymlink,
      ensureDirectory,
      removeDirectory,
    }: Dependencies = {
      workingDirectory: process.cwd(),
      resolvePath: _resolvePath,
      exists: existsAsd,
      readJsonFile: readJsonFileAsd,
      writeJsonFile: writeJsonFileAsd,
      createSymlink: createSymlinkAsd,
      ensureDirectory: ensureDirectoryAsd,
      removeDirectory: removeDirectoryAsd,
    },
  ): LensLink =>
  async () => {
    const getPackageJsons = getPackageJsonsFor(readJsonFile);
    const getLensLinkDirectory = getLensLinkDirectoryFor(workingDirectory, resolvePath);
    const getMissingPackageJsons = getMissingPackageJsonsFor(exists);

    const removeExistingLensLinkDirectories = removeExistingLensLinkDirectoriesFor(
      getLensLinkDirectory,
      exists,
      removeDirectory,
    );

    const createLensLinkDirectories = createLensLinkDirectoriesFor(getLensLinkDirectory, ensureDirectory);

    const getPackageJsonPaths = getPackageJsonPathsFor({
      workingDirectory,
      resolvePath,
      readJsonFile,
    });

    const configFilePath = resolvePath(workingDirectory, ".lens-links.json");

    const configFileExists = await exists(configFilePath);

    if (!configFileExists) {
      await writeJsonFile(configFilePath, []);

      return;
    }

    const packageJsonPaths = await getPackageJsonPaths(configFilePath);

    const missingPackageJsons = await getMissingPackageJsons(packageJsonPaths);

    if (missingPackageJsons.length) {
      throw new Error(
        `Tried to install Lens links, but configured package.jsons were not found: "${missingPackageJsons.join(
          '", "',
        )}".`,
      );
    }

    const packageJsons = await getPackageJsons(packageJsonPaths);

    await removeExistingLensLinkDirectories(packageJsons);

    await createLensLinkDirectories(packageJsons);

    pipeline(
      packageJsons,

      flatMap(({ packageJsonPath, content }) => {
        const lensLinkDirectory = getLensLinkDirectory(content.name);

        return [
          {
            target: packageJsonPath,
            source: resolvePath(lensLinkDirectory, "package.json"),
            type: "file" as const,
          },

          ...content.files.map((x) => ({
            target: resolvePath(dirname(packageJsonPath), x),
            source: resolvePath(lensLinkDirectory, x),
            type: "dir" as const,
          })),
        ];
      }),

      map(({ target, source, type }) => createSymlink(target, source, type)),
    );
  };
