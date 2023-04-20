import { getInjectable } from "@ogre-tools/injectable";
import fse from "fs-extra";
import type { JsonValue } from "type-fest";

export type ReadJsonFile = (path: string) => Promise<JsonValue>;

export const readJsonFileInjectable = getInjectable({
  id: "read-json-file",
  instantiate: (): ReadJsonFile => fse.readJson,
});
