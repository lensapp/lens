import { flatten, map, partition, uniq, uniqBy } from "lodash/fp";
import type { PackageJsonAndPath } from "./package-json-and-path";
import { globInjectable } from "./fs/glob.injectable";
import { resolvePathInjectable } from "./path/resolve-path.injectable";
import { awaitAll } from "./await-all";
import { getInjectable } from "@ogre-tools/injectable";
import { pipeline } from "@ogre-tools/fp";
import { getLensLinkDirectoryInjectable } from "./get-lens-link-directory.injectable";
import path from "path";
import { isFileOrDirectoryInjectable } from "./fs/is-file-or-directory.injectable";

const shouldBeGlobbed = (possibleGlobString: string) => possibleGlobString.includes("*");
const simplifyGlobbing = new RegExp("(\\/\\*\\/\\*\\*|\\/\\*\\*|\\/\\*\\*\\/\\*|\\/\\*)$");
const toAvoidableGlobStrings = (reference: string) => reference.replace(simplifyGlobbing, "");

export const getSymlinkPathsInjectable = getInjectable({
  id: "get-symlink-paths",

  instantiate: (di) => {
    const glob = di.inject(globInjectable);
    const resolvePath = di.inject(resolvePathInjectable);
    const getLensLinkDirectory = di.inject(getLensLinkDirectoryInjectable);
    const isFileOrDirectory = di.inject(isFileOrDirectoryInjectable);

    return async (packageJsons: PackageJsonAndPath[]) => {
      return pipeline(
        packageJsons,

        map(async ({ packageJsonPath, content }) => {
          const lensLinkDirectory = getLensLinkDirectory(content.name);

          const fileStrings = content.files.map(toAvoidableGlobStrings);

          const [toBeGlobbed, toNotBeGlobbed] = partition(shouldBeGlobbed)(fileStrings);

          const moduleDirectory = path.dirname(packageJsonPath);

          let globbeds: string[] = [];

          if (toBeGlobbed.length) {
            globbeds = await glob(toBeGlobbed, { cwd: moduleDirectory });
          }

          const notGlobbedFilesOrDirectories = await pipeline(
            toNotBeGlobbed,

            uniq,

            map(async (fileOrDirectory) => {
              const target = resolvePath(moduleDirectory, fileOrDirectory);

              return {
                target,
                source: resolvePath(lensLinkDirectory, fileOrDirectory),
                type: await isFileOrDirectory(target),
              };
            }),

            awaitAll,
          );

          return [
            {
              target: packageJsonPath,
              source: resolvePath(lensLinkDirectory, "package.json"),
              type: "file" as const,
            },

            ...globbeds.map((fileString) => ({
              target: resolvePath(moduleDirectory, fileString),
              source: resolvePath(lensLinkDirectory, fileString),
              type: "file" as const,
            })),

            ...notGlobbedFilesOrDirectories,
          ];
        }),

        awaitAll,

        flatten,

        uniqBy((x) => x.source),
      );
    };
  },
});
