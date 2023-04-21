import type { PackageJsonAndPath } from "./package-json-and-path";
import { globInjectable } from "./fs/glob.injectable";
import { resolvePathInjectable } from "./path/resolve-path.injectable";
import { awaitAll } from "./await-all";
import { flatten, map, partition } from "lodash/fp";
import { getInjectable } from "@ogre-tools/injectable";
import { pipeline } from "@ogre-tools/fp";
import { getLensLinkDirectoryInjectable } from "./get-lens-link-directory.injectable";
import path from "path";

const shouldBeGlobbed = (possibleGlobString: string) => possibleGlobString.includes("*");
const simplifyGlobbing = new RegExp("(\\/\\*\\/\\*\\*|\\/\\*\\*|\\/\\*\\*\\/\\*|\\/\\*)$");
const toAvoidableGlobStrings = (reference: string) => reference.replace(simplifyGlobbing, "");

export const getSymlinkPathsInjectable = getInjectable({
  id: "get-symlink-paths",

  instantiate: (di) => {
    const glob = di.inject(globInjectable);
    const resolvePath = di.inject(resolvePathInjectable);
    const getLensLinkDirectory = di.inject(getLensLinkDirectoryInjectable);

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

            ...toNotBeGlobbed.map((fileOrDirectory) => ({
              target: resolvePath(moduleDirectory, fileOrDirectory),
              source: resolvePath(lensLinkDirectory, fileOrDirectory),
              type: "dir" as const,
            })),
          ];
        }),

        awaitAll,

        flatten,
      );
    };
  },
});
