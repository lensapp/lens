import type { Exists } from "./lens-link";
import { pipeline } from "@ogre-tools/fp";
import { map, filter } from "lodash/fp";
import { awaitAll } from "./await-all";

export const getMissingPackageJsonsFor = (exists: Exists) => async (packageJsonPaths: string[]) =>
  pipeline(
    packageJsonPaths,
    map(async (packageJsonPath) => ({ packageJsonPath, exists: await exists(packageJsonPath) })),
    awaitAll,
    filter(({ exists }) => !exists),
    map(({ packageJsonPath }) => packageJsonPath),
  );
