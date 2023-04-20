import { awaitAll } from "./await-all";
import type { ReadJsonFile } from "./lens-link";
import { pipeline } from "@ogre-tools/fp";
import { map } from "lodash/fp";
import type { PackageJson } from "./package-json-and-path";

export const getPackageJsonsFor = (readJsonFile: ReadJsonFile) => async (packageJsonPaths: string[]) =>
  pipeline(
    packageJsonPaths,

    map(async (packageJsonPath) => ({
      packageJsonPath,
      content: (await readJsonFile(packageJsonPath)) as unknown as PackageJson,
    })),

    awaitAll,
  );
